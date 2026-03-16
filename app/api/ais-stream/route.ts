import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import WebSocket from 'ws'

const AIS_STREAM_URL = 'wss://stream.aisstream.io/v0/stream'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const AIS_SHIP_CATEGORIES: Record<number, string> = {
  80: 'tanker', 81: 'chemical_tanker', 82: 'chemical_tanker',
  83: 'tanker', 84: 'oil_tanker', 85: 'oil_tanker',
  86: 'lng_carrier', 87: 'lpg_carrier', 88: 'tanker', 89: 'tanker',
  70: 'general_cargo', 71: 'general_cargo', 72: 'general_cargo',
  73: 'general_cargo', 74: 'general_cargo', 75: 'bulk_carrier',
  76: 'bulk_carrier', 77: 'general_cargo', 78: 'general_cargo', 79: 'general_cargo',
}

function getShipCategory(shipType: number | undefined): string {
  if (!shipType) return 'other'
  return AIS_SHIP_CATEGORIES[shipType] || 'other'
}

// Batch upsert queue — flushes to Supabase every few seconds
const upsertQueue = new Map<string, Record<string, any>>()
let flushTimer: ReturnType<typeof setTimeout> | null = null

async function flushToSupabase() {
  if (upsertQueue.size === 0) return
  const rows = Array.from(upsertQueue.values())
  upsertQueue.clear()

  try {
    await supabase.from('vessels').upsert(rows, {
      onConflict: 'mmsi',
      ignoreDuplicates: false,
    })
  } catch { /* log silently in production */ }
}

function scheduleFlush() {
  if (flushTimer) return
  flushTimer = setTimeout(() => {
    flushTimer = null
    flushToSupabase()
  }, 3000)
}

function queuePositionUpsert(data: Record<string, any>) {
  const mmsi = data.mmsi as string
  const existing = upsertQueue.get(mmsi) || {}
  upsertQueue.set(mmsi, {
    ...existing,
    ...data,
    last_position_update: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })
  scheduleFlush()
}

export async function GET(req: NextRequest) {
  const apiKey = process.env.AIS_STREAM_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'AIS_STREAM_API_KEY not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const searchParams = req.nextUrl.searchParams
  const categories = searchParams.get('categories')?.split(',') || []
  const filterCategories = new Set(categories.filter(Boolean))

  const encoder = new TextEncoder()
  let wsConnection: WebSocket | null = null

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: any) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        } catch { /* stream closed */ }
      }

      wsConnection = new WebSocket(AIS_STREAM_URL)

      wsConnection.onopen = () => {
        const subscription = {
          APIKey: apiKey,
          BoundingBoxes: [[[-90, -180], [90, 180]]],
          FilterMessageTypes: ['PositionReport', 'ShipStaticData'],
        }
        wsConnection!.send(JSON.stringify(subscription))
        send({ type: 'connected' })
      }

      wsConnection.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data as string)
          const msgType = msg.MessageType
          const meta = msg.MetaData || {}

          if (msgType === 'PositionReport') {
            const pos = msg.Message?.PositionReport
            if (!pos) return

            const shipType = meta.ShipType ?? pos.ShipType
            const category = getShipCategory(shipType)

            if (filterCategories.size > 0 && !filterCategories.has(category)) return

            const vesselData = {
              mmsi: String(pos.UserID || meta.MMSI),
              vessel_name: meta.ShipName?.trim() || undefined,
              latitude: meta.latitude ?? pos.Latitude,
              longitude: meta.longitude ?? pos.Longitude,
              speed_knots: pos.Sog,
              course: pos.Cog,
              heading: pos.TrueHeading === 511 ? undefined : pos.TrueHeading,
              navigation_status: String(pos.NavigationalStatus ?? ''),
              ship_type: shipType,
              ship_category: category,
            }

            // Save to Supabase
            queuePositionUpsert(vesselData)

            send({ type: 'position', ...vesselData })
          }

          if (msgType === 'ShipStaticData') {
            const sd = msg.Message?.ShipStaticData
            if (!sd) return

            const category = getShipCategory(sd.Type)
            if (filterCategories.size > 0 && !filterCategories.has(category)) return

            const staticData: Record<string, any> = {
              mmsi: String(sd.UserID || meta.MMSI),
              vessel_name: sd.Name?.trim() || meta.ShipName?.trim(),
              ship_type: sd.Type,
              ship_category: category,
              destination: sd.Destination?.trim() || undefined,
              call_sign: sd.CallSign?.trim() || undefined,
            }
            if (sd.ImoNumber) staticData.imo_number = String(sd.ImoNumber)
            if (sd.Dimension) {
              const len = (sd.Dimension.A || 0) + (sd.Dimension.B || 0)
              const wid = (sd.Dimension.C || 0) + (sd.Dimension.D || 0)
              if (len > 0) staticData.length_meters = len
              if (wid > 0) staticData.width_meters = wid
            }
            if (sd.MaximumStaticDraught) staticData.draught = sd.MaximumStaticDraught

            // Save to Supabase
            queuePositionUpsert(staticData)

            send({ type: 'static', ...staticData })
          }
        } catch { /* skip malformed messages */ }
      }

      wsConnection.onerror = () => {
        send({ type: 'error', message: 'AIS Stream connection error' })
      }

      wsConnection.onclose = () => {
        flushToSupabase()
        send({ type: 'disconnected' })
        try { controller.close() } catch { /* already closed */ }
      }
    },
    cancel() {
      flushToSupabase()
      if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
        wsConnection.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
