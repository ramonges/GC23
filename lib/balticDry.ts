import snapshot from '@/data/baltic-dry.json'

/** Ports the cost model already knows. Matching uses name and region only. */
export interface BalticPortRef {
  name: string
  region: string
}

export type BalticCharter = 'voyage' | 'time' | 'bareboat'
export type BalticFit = 'exact' | 'region' | 'timecharter' | 'average'
export type BalticUnit = 'usd_per_mt' | 'usd_per_day'
type BalticClass = 'Capesize' | 'Panamax' | 'Supramax' | 'Handysize'

interface SeriesPoint {
  latest: number | null
  avg30: number | null
  asOf: string | null
  sessions: number
  stale: boolean
}

interface RouteDef {
  id: string
  name: string
  description: string
  vesselClass: BalticClass
  unit: BalticUnit
  /** Paired TCE column for a voyage assessment, used when the charter is paid per day. */
  tceId?: string
  classes: BalticClass[]
  score: number
  fit: Exclude<BalticFit, 'average'>
  test: (origin: BalticPortRef, destination: BalticPortRef) => boolean
}

const series = snapshot.series as Record<string, SeriesPoint>

const EAST_ASIA = 'East Asia'
const NORTH_EUROPE = 'North Europe'
const EAST_MED = 'East Mediterranean'
const OCEANIA = 'Oceania'
const SE_ASIA = 'Southeast Asia'
const US_GULF = 'US Gulf'
const US_EAST = 'US East Coast'
const SOUTH_AMERICA = 'South America'
const WEST_AFRICA = 'West Africa'
const SOUTH_AFRICA = 'South Africa'
const RED_SEA = 'Red Sea'
const MIDDLE_EAST = 'Middle East'

const ATLANTIC = [NORTH_EUROPE, EAST_MED, US_GULF, US_EAST, SOUTH_AMERICA, WEST_AFRICA, SOUTH_AFRICA]
const PACIFIC = [EAST_ASIA, OCEANIA, SE_ASIA]
const EUROPE = [NORTH_EUROPE, EAST_MED]
const US_COAST = [US_GULF, US_EAST]
const CHINA_KOREA = [EAST_ASIA]

const inList = (region: string, list: string[]) => list.includes(region)
const both = (origin: BalticPortRef, destination: BalticPortRef, list: string[]) =>
  inList(origin.region, list) && inList(destination.region, list)

const BASKET: Record<BalticClass, { id: string; name: string }> = {
  Capesize: { id: 'C5TC (182)', name: 'C5TC capesize average' },
  Panamax: { id: 'P5TC', name: 'P5TC panamax average' },
  Supramax: { id: 'S11TC', name: 'S11TC supramax average' },
  Handysize: { id: 'HS7TC', name: 'HS7TC handysize average' },
}

/**
 * Point-to-point and basin routes from the Baltic dry bulk assessments.
 * Voyage routes with a $/mt print are preferred over a round-voyage TCE
 * when both could describe the same lane.
 * C19 is in the snapshot (a $/mt print plus a TCE) but the public route list
 * does not name that lane, so it is kept in the data and not applied to a port pair.
 */
const ROUTES: RouteDef[] = [
  {
    id: 'C3', name: 'C3 Tubarao → Qingdao', vesselClass: 'Capesize', unit: 'usd_per_mt', tceId: 'C3-TCE',
    description: 'Tubarao to Qingdao, 170,000 mt iron ore.',
    classes: ['Capesize'], score: 100, fit: 'exact',
    test: (o, d) => o.name === 'Tubarao' && d.region === EAST_ASIA,
  },
  {
    id: 'C3', name: 'C3 Brazil → China', vesselClass: 'Capesize', unit: 'usd_per_mt', tceId: 'C3-TCE',
    description: 'Capesize Brazil to China, benchmarked on C3 Tubarao–Qingdao.',
    classes: ['Capesize'], score: 80, fit: 'region',
    test: (o, d) => o.region === SOUTH_AMERICA && o.name !== 'Bolivar' && d.region === EAST_ASIA,
  },
  {
    id: 'C5', name: 'C5 West Australia → Qingdao', vesselClass: 'Capesize', unit: 'usd_per_mt', tceId: 'C5-TCE',
    description: 'West Australia to Qingdao, 160,000–170,000 mt iron ore.',
    classes: ['Capesize'], score: 100, fit: 'exact',
    test: (o, d) => (o.name === 'Port Hedland' || o.name === 'Dampier') && d.region === EAST_ASIA,
  },
  {
    id: 'C5', name: 'C5 Australia → China', vesselClass: 'Capesize', unit: 'usd_per_mt', tceId: 'C5-TCE',
    description: 'Capesize Australia to China, benchmarked on C5 West Australia–Qingdao.',
    classes: ['Capesize'], score: 80, fit: 'region',
    test: (o, d) => o.region === OCEANIA && d.region === EAST_ASIA,
  },
  {
    id: 'C2', name: 'C2 Tubarao → Rotterdam', vesselClass: 'Capesize', unit: 'usd_per_mt', tceId: 'C2-TCE',
    description: 'Tubarao to Rotterdam, 170,000 mt iron ore.',
    classes: ['Capesize'], score: 100, fit: 'exact',
    test: (o, d) => o.name === 'Tubarao' && d.region === NORTH_EUROPE,
  },
  {
    id: 'C2', name: 'C2 Brazil → North Europe', vesselClass: 'Capesize', unit: 'usd_per_mt', tceId: 'C2-TCE',
    description: 'Capesize Brazil to North Europe, benchmarked on C2 Tubarao–Rotterdam.',
    classes: ['Capesize'], score: 80, fit: 'region',
    test: (o, d) => o.region === SOUTH_AMERICA && o.name !== 'Bolivar' && d.region === NORTH_EUROPE,
  },
  {
    id: 'C7', name: 'C7 Bolivar → Rotterdam', vesselClass: 'Capesize', unit: 'usd_per_mt', tceId: 'C7-TCE',
    description: 'Bolivar to Rotterdam, 160,000 mt coal.',
    classes: ['Capesize'], score: 100, fit: 'exact',
    test: (o, d) => o.name === 'Bolivar' && d.region === NORTH_EUROPE,
  },
  {
    id: 'C17', name: 'C17 Saldanha Bay → Qingdao', vesselClass: 'Capesize', unit: 'usd_per_mt', tceId: 'C17-TCE',
    description: 'Saldanha Bay to Qingdao, 170,000 mt iron ore. Richards Bay uses this South Africa–China assessment.',
    classes: ['Capesize'], score: 100, fit: 'exact',
    test: (o, d) => o.name === 'Richards Bay' && d.region === EAST_ASIA,
  },
  {
    id: 'C17', name: 'C17 South Africa → China', vesselClass: 'Capesize', unit: 'usd_per_mt', tceId: 'C17-TCE',
    description: 'Capesize South Africa to China, benchmarked on C17.',
    classes: ['Capesize'], score: 80, fit: 'region',
    test: (o, d) => o.region === SOUTH_AFRICA && d.region === EAST_ASIA,
  },
  {
    id: 'P7', name: 'P7 US Gulf → Qingdao', vesselClass: 'Panamax', unit: 'usd_per_mt', tceId: 'P7-TCE',
    description: 'Mississippi River to Qingdao, 66,000 mt grain.',
    classes: ['Panamax'], score: 100, fit: 'exact',
    test: (o, d) => (o.name === 'Houston' || o.name === 'New Orleans') && d.region === EAST_ASIA,
  },
  {
    id: 'P7', name: 'P7 US Gulf → China', vesselClass: 'Panamax', unit: 'usd_per_mt', tceId: 'P7-TCE',
    description: 'Panamax US Gulf to China, benchmarked on P7.',
    classes: ['Panamax'], score: 80, fit: 'region',
    test: (o, d) => o.region === US_GULF && d.region === EAST_ASIA,
  },
  {
    id: 'P8', name: 'P8 Santos → Qingdao', vesselClass: 'Panamax', unit: 'usd_per_mt', tceId: 'P8-TCE',
    description: 'Santos to Qingdao, 66,000 mt grain.',
    classes: ['Panamax'], score: 100, fit: 'exact',
    test: (o, d) => o.name === 'Santos' && d.region === EAST_ASIA,
  },
  {
    id: 'P8', name: 'P8 Brazil → China', vesselClass: 'Panamax', unit: 'usd_per_mt', tceId: 'P8-TCE',
    description: 'Panamax Brazil to China, benchmarked on P8 Santos–Qingdao.',
    classes: ['Panamax'], score: 80, fit: 'region',
    test: (o, d) => o.region === SOUTH_AMERICA && d.region === EAST_ASIA,
  },
  {
    id: 'C9_182', name: 'C9 Continent → China-Japan', vesselClass: 'Capesize', unit: 'usd_per_day',
    description: 'Delivery Continent or Mediterranean, redelivery China-Japan, about 65 days.',
    classes: ['Capesize'], score: 70, fit: 'timecharter',
    test: (o, d) => inList(o.region, EUROPE) && d.region === EAST_ASIA,
  },
  {
    id: 'C16_182', name: 'C16 Far East → Atlantic backhaul', vesselClass: 'Capesize', unit: 'usd_per_day',
    description: 'Delivery North China–South Japan for a trip redelivery UK-Continent-Mediterranean.',
    classes: ['Capesize'], score: 70, fit: 'timecharter',
    test: (o, d) => o.region === EAST_ASIA && inList(d.region, ATLANTIC),
  },
  {
    id: 'C10_182', name: 'C10 Pacific round voyage', vesselClass: 'Capesize', unit: 'usd_per_day',
    description: 'Delivery Qingdao, China-Japan transpacific round voyage, 35–45 days.',
    classes: ['Capesize'], score: 60, fit: 'timecharter',
    test: (o, d) => both(o, d, PACIFIC),
  },
  {
    id: 'C8_182', name: 'C8 transatlantic round voyage', vesselClass: 'Capesize', unit: 'usd_per_day',
    description: 'Delivery Gibraltar–Hamburg, transatlantic round voyage, 30–45 days.',
    classes: ['Capesize'], score: 60, fit: 'timecharter',
    test: (o, d) => both(o, d, ATLANTIC),
  },
  {
    id: 'P13', name: 'P13 China via East Australia', vesselClass: 'Panamax', unit: 'usd_per_day',
    description: 'Delivery China-Japan-Korea, via east Australia, redelivery South China, 30–40 days.',
    classes: ['Panamax'], score: 75, fit: 'timecharter',
    test: (o, d) => (o.region === EAST_ASIA && d.region === OCEANIA) || (o.region === OCEANIA && d.region === EAST_ASIA),
  },
  {
    id: 'P5_82', name: 'P5 South China–Indonesia round', vesselClass: 'Panamax', unit: 'usd_per_day',
    description: 'Delivery South China, via Indonesia, redelivery South China, 20–25 days.',
    classes: ['Panamax'], score: 75, fit: 'timecharter',
    test: (o, d) => (o.region === SE_ASIA && d.region === EAST_ASIA) || (o.region === EAST_ASIA && d.region === SE_ASIA) || (o.region === SE_ASIA && d.region === SE_ASIA),
  },
  {
    id: 'P2A_82', name: 'P2A Continent → Far East', vesselClass: 'Panamax', unit: 'usd_per_day',
    description: 'Delivery Skaw–Gibraltar, redelivery Hong Kong–South Korea including Taiwan.',
    classes: ['Panamax'], score: 70, fit: 'timecharter',
    test: (o, d) => inList(o.region, EUROPE) && inList(d.region, CHINA_KOREA),
  },
  {
    id: 'P4_82', name: 'P4 Far East → Continent', vesselClass: 'Panamax', unit: 'usd_per_day',
    description: 'Delivery Hong Kong–South Korea, redelivery Skaw–Gibraltar.',
    classes: ['Panamax'], score: 70, fit: 'timecharter',
    test: (o, d) => o.region === EAST_ASIA && inList(d.region, [...EUROPE, ...US_COAST]),
  },
  {
    id: 'P6_82', name: 'P6 Singapore via Atlantic', vesselClass: 'Panamax', unit: 'usd_per_day',
    description: 'Delivery Singapore, round voyage via the Atlantic, redelivery Hong Kong–South Korea.',
    classes: ['Panamax'], score: 70, fit: 'timecharter',
    test: (o, d) => (o.region === SE_ASIA && inList(d.region, ATLANTIC)) || (inList(o.region, ATLANTIC) && d.region === SE_ASIA),
  },
  {
    id: 'P12', name: 'P12 US East Coast → India', vesselClass: 'Panamax', unit: 'usd_per_day',
    description: 'Delivery Skaw–Gibraltar, via the US East Coast, redelivery India, 60–70 days.',
    classes: ['Panamax'], score: 70, fit: 'timecharter',
    test: (o, d) => inList(o.region, [...EUROPE, US_EAST]) && d.region === 'India',
  },
  {
    id: 'P1A_82', name: 'P1A transatlantic round voyage', vesselClass: 'Panamax', unit: 'usd_per_day',
    description: 'Delivery Skaw–Gibraltar, transatlantic round voyage, redelivery Skaw–Gibraltar.',
    classes: ['Panamax'], score: 60, fit: 'timecharter',
    test: (o, d) => both(o, d, ATLANTIC),
  },
  {
    id: 'P3A_82', name: 'P3A Pacific round voyage', vesselClass: 'Panamax', unit: 'usd_per_day',
    description: 'Delivery Hong Kong–South Korea, transpacific round voyage.',
    classes: ['Panamax'], score: 60, fit: 'timecharter',
    test: (o, d) => both(o, d, PACIFIC),
  },
  {
    id: 'S1C', name: 'S1C US Gulf → China-Japan', vesselClass: 'Supramax', unit: 'usd_per_day',
    description: 'Delivery US Gulf, redelivery north China–south Japan, 50–55 days.',
    classes: ['Supramax'], score: 75, fit: 'timecharter',
    test: (o, d) => inList(o.region, US_COAST) && d.region === EAST_ASIA,
  },
  {
    id: 'S4A', name: 'S4A US Gulf → Skaw-Passero', vesselClass: 'Supramax', unit: 'usd_per_day',
    description: 'Delivery US Gulf, redelivery Skaw–Passero, 25–30 days.',
    classes: ['Supramax'], score: 75, fit: 'timecharter',
    test: (o, d) => inList(o.region, US_COAST) && inList(d.region, EUROPE),
  },
  {
    id: 'S4B', name: 'S4B Skaw-Passero → US Gulf', vesselClass: 'Supramax', unit: 'usd_per_day',
    description: 'Delivery Skaw–Passero, redelivery US Gulf, 25–30 days.',
    classes: ['Supramax'], score: 75, fit: 'timecharter',
    test: (o, d) => inList(o.region, EUROPE) && inList(d.region, US_COAST),
  },
  {
    id: 'S5', name: 'S5 West Africa → North China', vesselClass: 'Supramax', unit: 'usd_per_day',
    description: 'Delivery West Africa via east coast South America, redelivery north China.',
    classes: ['Supramax'], score: 75, fit: 'timecharter',
    test: (o, d) => o.region === WEST_AFRICA && d.region === EAST_ASIA,
  },
  {
    id: 'S9', name: 'S9 West Africa → Skaw-Passero', vesselClass: 'Supramax', unit: 'usd_per_day',
    description: 'Delivery West Africa via east coast South America, redelivery Skaw–Passero.',
    classes: ['Supramax'], score: 75, fit: 'timecharter',
    test: (o, d) => inList(o.region, [WEST_AFRICA, SOUTH_AMERICA]) && inList(d.region, EUROPE),
  },
  {
    id: 'S3', name: 'S3 North China → West Africa', vesselClass: 'Supramax', unit: 'usd_per_day',
    description: 'Delivery north China, redelivery West Africa.',
    classes: ['Supramax'], score: 75, fit: 'timecharter',
    test: (o, d) => o.region === EAST_ASIA && inList(d.region, [WEST_AFRICA, SOUTH_AFRICA]),
  },
  {
    id: 'S1B', name: 'S1B Mediterranean → China-Korea', vesselClass: 'Supramax', unit: 'usd_per_day',
    description: 'Delivery passing Canakkale via the Mediterranean or Black Sea, redelivery China–South Korea.',
    classes: ['Supramax'], score: 75, fit: 'timecharter',
    test: (o, d) => o.region === EAST_MED && d.region === EAST_ASIA,
  },
  {
    id: 'S15', name: 'S15 Indian Ocean → Far East', vesselClass: 'Supramax', unit: 'usd_per_day',
    description: 'Delivery passing Colombo via South Africa, redelivery China–South Korea.',
    classes: ['Supramax'], score: 70, fit: 'timecharter',
    test: (o, d) => inList(o.region, [SOUTH_AFRICA, MIDDLE_EAST, RED_SEA]) && d.region === EAST_ASIA,
  },
  {
    id: 'S2', name: 'S2 North China–Australia round', vesselClass: 'Supramax', unit: 'usd_per_day',
    description: 'Delivery north China, Australian or Pacific round voyage, redelivery north China.',
    classes: ['Supramax'], score: 70, fit: 'timecharter',
    test: (o, d) => (o.region === EAST_ASIA && d.region === OCEANIA) || (o.region === OCEANIA && d.region === EAST_ASIA),
  },
  {
    id: 'S10', name: 'S10 South China via Indonesia', vesselClass: 'Supramax', unit: 'usd_per_day',
    description: 'Delivery South China, via Indonesia, redelivery South China.',
    classes: ['Supramax'], score: 70, fit: 'timecharter',
    test: (o, d) => (o.region === EAST_ASIA || o.region === SE_ASIA) && (d.region === EAST_ASIA || d.region === SE_ASIA),
  },
  {
    id: 'HS4_38', name: 'HS4 US Gulf → Skaw-Passero', vesselClass: 'Handysize', unit: 'usd_per_day',
    description: 'Delivery US Gulf, via the US Gulf or north coast South America, redelivery Skaw–Passero.',
    classes: ['Handysize'], score: 75, fit: 'timecharter',
    test: (o, d) => inList(o.region, US_COAST) && inList(d.region, EUROPE),
  },
  {
    id: 'HS2_38', name: 'HS2 Skaw-Passero → US Gulf', vesselClass: 'Handysize', unit: 'usd_per_day',
    description: 'Delivery Skaw–Passero, redelivery Boston–Galveston.',
    classes: ['Handysize'], score: 75, fit: 'timecharter',
    test: (o, d) => inList(o.region, EUROPE) && inList(d.region, US_COAST),
  },
  {
    id: 'HS1_38', name: 'HS1 Skaw-Passero → east coast South America', vesselClass: 'Handysize', unit: 'usd_per_day',
    description: 'Delivery Skaw–Passero, redelivery Recalada–Rio de Janeiro.',
    classes: ['Handysize'], score: 75, fit: 'timecharter',
    test: (o, d) => inList(o.region, EUROPE) && d.region === SOUTH_AMERICA,
  },
  {
    id: 'HS3_38', name: 'HS3 east coast South America → Skaw-Passero', vesselClass: 'Handysize', unit: 'usd_per_day',
    description: 'Delivery Recalada–Rio de Janeiro, redelivery Skaw–Passero.',
    classes: ['Handysize'], score: 75, fit: 'timecharter',
    test: (o, d) => o.region === SOUTH_AMERICA && inList(d.region, EUROPE),
  },
  {
    id: 'HS5_38', name: 'HS5 Southeast Asia → Singapore-Japan', vesselClass: 'Handysize', unit: 'usd_per_day',
    description: 'Delivery Southeast Asia, redelivery Singapore–Japan including China.',
    classes: ['Handysize'], score: 75, fit: 'timecharter',
    test: (o, d) => o.region === SE_ASIA && d.region === EAST_ASIA,
  },
  {
    id: 'HS7_38', name: 'HS7 North China → Southeast Asia', vesselClass: 'Handysize', unit: 'usd_per_day',
    description: 'Delivery North China–South Korea–Japan, redelivery Southeast Asia.',
    classes: ['Handysize'], score: 75, fit: 'timecharter',
    test: (o, d) => o.region === EAST_ASIA && d.region === SE_ASIA,
  },
  {
    id: 'HS6_38', name: 'HS6 North Pacific round', vesselClass: 'Handysize', unit: 'usd_per_day',
    description: 'Delivery and redelivery North China–South Korea–Japan.',
    classes: ['Handysize'], score: 70, fit: 'timecharter',
    test: (o, d) => o.region === EAST_ASIA && d.region === EAST_ASIA,
  },
  {
    id: 'HSATC', name: 'Handysize Atlantic average', vesselClass: 'Handysize', unit: 'usd_per_day',
    description: 'Average of the four Atlantic handysize routes.',
    classes: ['Handysize'], score: 40, fit: 'timecharter',
    test: (o, d) => both(o, d, ATLANTIC),
  },
  {
    id: 'HSPTC', name: 'Handysize Pacific average', vesselClass: 'Handysize', unit: 'usd_per_day',
    description: 'Average of the three Pacific handysize routes.',
    classes: ['Handysize'], score: 40, fit: 'timecharter',
    test: (o, d) => both(o, d, PACIFIC),
  },
]

export interface DryFreightQuote {
  id: string
  name: string
  description: string
  vesselClass: BalticClass
  unit: BalticUnit
  latest: number
  avg30: number
  asOf: string
  fit: BalticFit
  /** Set when the selected ship is not the Baltic vessel the assessment is based on. */
  proxyNote: string | null
}

export const BALTIC_AS_OF = snapshot.asOf

function point(id: string): SeriesPoint | null {
  const row = series[id]
  if (!row || row.stale || row.latest == null || row.avg30 == null || !row.asOf) return null
  return row
}

export function balticClassFor(vesselClass: string): BalticClass | null {
  if (vesselClass === 'Capesize' || vesselClass === 'Panamax' || vesselClass === 'Supramax' || vesselClass === 'Handysize') {
    return vesselClass
  }
  if (vesselClass === 'Handymax') return 'Handysize'
  return null
}

export function dryBasket(vesselClass: string): DryFreightQuote | null {
  const balticClass = balticClassFor(vesselClass)
  if (!balticClass) return null
  const basket = BASKET[balticClass]
  const row = point(basket.id)
  if (!row || row.latest == null || row.avg30 == null || !row.asOf) return null
  return {
    id: basket.id,
    name: basket.name,
    description: 'Weighted time-charter average for this vessel size. Used when no Baltic route matches the lane.',
    vesselClass: balticClass,
    unit: 'usd_per_day',
    latest: row.latest,
    avg30: row.avg30,
    asOf: row.asOf,
    fit: 'average',
    proxyNote: vesselClass === 'Handymax' ? 'Handymax is priced on the Baltic handysize 38,000 dwt average.' : null,
  }
}

function fromRoute(route: RouteDef, fit: BalticFit, unit: BalticUnit, id: string, proxyNote: string | null): DryFreightQuote | null {
  const row = point(id)
  if (!row || row.latest == null || row.avg30 == null || !row.asOf) return null
  return {
    id,
    name: route.name,
    description: route.description,
    vesselClass: route.vesselClass,
    unit,
    latest: row.latest,
    avg30: row.avg30,
    asOf: row.asOf,
    fit,
    proxyNote,
  }
}

/** Latest Baltic dry assessment for a laden voyage between two of the model's ports. */
export function quoteDryFreight(
  origin: BalticPortRef,
  destination: BalticPortRef,
  vesselClass: string,
  charter: BalticCharter = 'voyage',
): DryFreightQuote | null {
  const balticClass = balticClassFor(vesselClass)
  if (!balticClass) return null
  const proxyNote = vesselClass === 'Handymax'
    ? 'Handymax is priced on the Baltic handysize 38,000 dwt routes.'
    : null

  const match = ROUTES
    .filter((route) => route.classes.includes(balticClass) && route.test(origin, destination))
    .sort((a, b) => b.score - a.score)[0]

  if (!match) return dryBasket(vesselClass)

  const daily = charter === 'time' || charter === 'bareboat'
  if (daily && match.unit === 'usd_per_mt' && match.tceId) {
    const tce = fromRoute(match, match.fit, 'usd_per_day', match.tceId, proxyNote)
    if (tce) {
      tce.name = `${match.id} TCE · ${match.name.replace(/^.*? /, '')}`
      tce.description = `Time-charter equivalent of ${match.description}`
      return tce
    }
  }
  return fromRoute(match, match.fit, match.unit, match.id, proxyNote) ?? dryBasket(vesselClass)
}

function roundMt(value: number): string {
  return (Math.round((value + 1e-8) * 100) / 100).toFixed(2)
}

export function formatBalticRate(quote: DryFreightQuote): string {
  if (quote.unit === 'usd_per_mt') return `$${roundMt(quote.latest)}/mt`
  return `$${Math.round(quote.latest).toLocaleString('en-US')}/day`
}

export function formatBalticAverage(quote: DryFreightQuote): string {
  if (quote.unit === 'usd_per_mt') return `$${roundMt(quote.avg30)}/mt`
  return `$${Math.round(quote.avg30).toLocaleString('en-US')}/day`
}

/** Market date of the print, already a calendar date in the Baltic file. */
export function formatBalticAsOf(asOf: string): string {
  const [year, month, day] = asOf.split('-').map(Number)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${day} ${months[(month || 1) - 1]} ${year}`
}
