import { NextRequest } from 'next/server'
import WebSocket from 'ws'

const AIS_STREAM_URL = 'wss://stream.aisstream.io/v0/stream'

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

            send({
              type: 'position',
              mmsi: String(pos.UserID || meta.MMSI),
              vessel_name: meta.ShipName?.trim() || undefined,
              latitude: meta.latitude ?? pos.Latitude,
              longitude: meta.longitude ?? pos.Longitude,
              speed_knots: pos.Sog,
              course: pos.Cog,
              heading: pos.TrueHeading === 511 ? undefined : pos.TrueHeading,
              navigation_status: pos.NavigationalStatus,
              ship_type: shipType,
              ship_category: category,
            })
          }

          if (msgType === 'ShipStaticData') {
            const sd = msg.Message?.ShipStaticData
            if (!sd) return

            const category = getShipCategory(sd.Type)
            if (filterCategories.size > 0 && !filterCategories.has(category)) return

            send({
              type: 'static',
              mmsi: String(sd.UserID || meta.MMSI),
              vessel_name: sd.Name?.trim() || meta.ShipName?.trim(),
              ship_type: sd.Type,
              ship_category: category,
              imo_number: sd.ImoNumber ? String(sd.ImoNumber) : undefined,
              call_sign: sd.CallSign?.trim(),
              destination: sd.Destination?.trim(),
              length_meters: sd.Dimension ? (sd.Dimension.A || 0) + (sd.Dimension.B || 0) : undefined,
              width_meters: sd.Dimension ? (sd.Dimension.C || 0) + (sd.Dimension.D || 0) : undefined,
              draught: sd.MaximumStaticDraught,
            })
          }
        } catch { /* skip malformed messages */ }
      }

      wsConnection.onerror = () => {
        send({ type: 'error', message: 'AIS Stream connection error' })
      }

      wsConnection.onclose = () => {
        send({ type: 'disconnected' })
        try { controller.close() } catch { /* already closed */ }
      }
    },
    cancel() {
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
