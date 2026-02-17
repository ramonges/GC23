import { NextRequest, NextResponse } from 'next/server'

const FRED_API_KEY = '6e604ef99f29aa96480a8236b605c32c'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const seriesId = searchParams.get('series_id')
  const start = searchParams.get('observation_start') || '2020-01-01'
  const end = searchParams.get('observation_end') || new Date().toISOString().split('T')[0]

  if (!seriesId) {
    return NextResponse.json({ error: 'series_id is required' }, { status: 400 })
  }

  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${encodeURIComponent(seriesId)}&api_key=${FRED_API_KEY}&file_type=json&observation_start=${start}&observation_end=${end}&sort_order=asc`

  try {
    const resp = await fetch(url)
    if (!resp.ok) {
      return NextResponse.json({ error: `FRED returned ${resp.status}` }, { status: resp.status })
    }
    const data = await resp.json()
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch from FRED' }, { status: 500 })
  }
}
