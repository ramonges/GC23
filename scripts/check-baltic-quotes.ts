import { quoteDryFreight, formatBalticRate } from '../lib/balticDry'

const ports = {
  tubarao: { name: 'Tubarao', region: 'South America' },
  santos: { name: 'Santos', region: 'South America' },
  bolivar: { name: 'Bolivar', region: 'South America' },
  hedland: { name: 'Port Hedland', region: 'Oceania' },
  newcastle: { name: 'Newcastle', region: 'Oceania' },
  richards: { name: 'Richards Bay', region: 'South Africa' },
  qingdao: { name: 'Qingdao', region: 'East Asia' },
  rotterdam: { name: 'Rotterdam', region: 'North Europe' },
  houston: { name: 'Houston', region: 'US Gulf' },
  singapore: { name: 'Singapore', region: 'Southeast Asia' },
  lagos: { name: 'Lagos', region: 'West Africa' },
}

const cases: Array<[string, typeof ports.tubarao, typeof ports.qingdao, string, string, string]> = [
  ['C3 exact', ports.tubarao, ports.qingdao, 'Capesize', 'voyage', 'C3'],
  ['C5 exact', ports.hedland, ports.qingdao, 'Capesize', 'voyage', 'C5'],
  ['C5 region', ports.newcastle, ports.qingdao, 'Capesize', 'voyage', 'C5'],
  ['C2 exact', ports.tubarao, ports.rotterdam, 'Capesize', 'voyage', 'C2'],
  ['C7 exact', ports.bolivar, ports.rotterdam, 'Capesize', 'voyage', 'C7'],
  ['C17 exact', ports.richards, ports.qingdao, 'Capesize', 'voyage', 'C17'],
  ['C3 tce', ports.tubarao, ports.qingdao, 'Capesize', 'time', 'C3-TCE'],
  ['P7 exact', ports.houston, ports.qingdao, 'Panamax', 'voyage', 'P7'],
  ['P8 region', ports.tubarao, ports.qingdao, 'Panamax', 'voyage', 'P8'],
  ['P1A', ports.houston, ports.rotterdam, 'Panamax', 'voyage', 'P1A_82'],
  ['S4A', ports.houston, ports.rotterdam, 'Supramax', 'voyage', 'S4A'],
  ['S1C', ports.houston, ports.qingdao, 'Supramax', 'voyage', 'S1C'],
  ['HS4', ports.houston, ports.rotterdam, 'Handysize', 'voyage', 'HS4_38'],
  ['Handymax proxy', ports.houston, ports.rotterdam, 'Handymax', 'voyage', 'HS4_38'],
  ['C10 pacific', ports.qingdao, ports.hedland, 'Capesize', 'voyage', 'C10_182'],
  ['basket', ports.lagos, ports.rotterdam, 'Capesize', 'voyage', 'C8_182'],
  ['tanker none', ports.houston, ports.rotterdam, 'VLCC', 'voyage', ''],
]

let failed = 0
for (const [label, origin, destination, vessel, charter, expectId] of cases) {
  const quote = quoteDryFreight(origin, destination, vessel, charter as 'voyage' | 'time')
  const got = quote?.id ?? ''
  const ok = got === expectId
  if (!ok) failed += 1
  console.log(`${ok ? 'ok' : 'FAIL'} ${label}: ${got || 'none'} ${quote ? formatBalticRate(quote) : ''} (expected ${expectId || 'none'})`)
}
if (failed) {
  console.error(`${failed} mismatched`)
  process.exit(1)
}
