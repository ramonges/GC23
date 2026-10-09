/** Hero timeline content. Times are seconds on the autoplay timeline. */

export const HERO_DURATION = 43.5

/** When the six /robots models start rising at the end of the factory. */
export const LINEUP_AT = 38.6

/** Same robots and order as the /robots showroom (data/robots/robots.json). */
export const HERO_LINEUP = [
  { id: 'optimus', name: 'Tesla Optimus', model: '/models/robots/optimus.glb' },
  { id: 'reachy2', name: 'Reachy 2', model: '/models/robots/reachy2.glb' },
  { id: 'g1', name: 'Unitree G1', model: '/models/robots/g1.glb' },
  { id: 'microduck', name: 'Microduck', model: '/models/robots/microduck.glb' },
  { id: 'reachy_mini', name: 'Reachy Mini', model: '/models/robots/reachy_mini.glb' },
  { id: 'spot', name: 'Spot', model: '/models/robots/spot.glb' },
]

export type HeroLabel = { anchor: string; text: string; from: number; to: number; tone?: 'signal' | 'muted'; lines?: string[] }
export type DataRow = [string, string]

export type HeroStage = {
  id: string
  number?: string
  title?: string
  headline?: string
  copy?: string
  start: number
  end: number
  group: number
  card?: DataRow[]
  flow?: string[]
  metrics?: DataRow[]
}

export const TIMELINE_GROUPS = [
  { number: '01', label: 'Origins', start: 0, end: 12.5 },
  { number: '02', label: 'Logistics', start: 12.5, end: 23.5 },
  { number: '03', label: 'Transformation', start: 23.5, end: 30 },
  { number: '04', label: 'Manufacturing', start: 30, end: HERO_DURATION },
]

export const HERO_STAGES: HeroStage[] = [
  { id: 'opening', start: 0, end: 4.4, group: 0 },
  { id: 'origin', number: '01', title: 'Material origin', headline: 'Guinea', copy: 'Bauxite region', start: 4.4, end: 8.2, group: 0 },
  {
    id: 'extraction',
    number: '02',
    title: 'Extraction',
    copy: 'Bauxite is mined from open-pit sites in Guinea’s major producing regions.',
    start: 8.2,
    end: 12.5,
    group: 0,
    card: [['Material', 'Raw bauxite'], ['Origin', 'Guinea'], ['Method', 'Open-pit extraction'], ['Next node', 'Kamsar Port']],
  },
  {
    id: 'inland',
    number: '03',
    title: 'Inland transit',
    copy: 'From mine to storage, rail, and port infrastructure.',
    start: 12.5,
    end: 16.2,
    group: 1,
    card: [['Mode', 'Heavy truck'], ['Material', 'Raw bauxite'], ['Origin', 'Guinea interior'], ['Next node', 'Kamsar']],
  },
  { id: 'port', number: '04', title: 'Port', copy: 'Material enters the global maritime supply chain.', start: 16.2, end: 19.6, group: 1 },
  {
    id: 'maritime',
    number: '05',
    title: 'Maritime shipping',
    copy: 'From Guinea to international refining and manufacturing networks.',
    start: 19.6,
    end: 23.5,
    group: 1,
    card: [['Mode', 'Dry-bulk shipping'], ['Origin', 'Kamsar, Guinea'], ['Destination', 'United States']],
  },
  { id: 'refining', number: '06', title: 'Refining', copy: 'Bauxite becomes alumina through the Bayer Process.', start: 23.5, end: 27.1, group: 2, flow: ['Bauxite', 'Alumina'] },
  {
    id: 'smelting',
    number: '07',
    title: 'Smelting',
    copy: 'Alumina becomes aluminum through electricity-intensive electrolysis.',
    start: 27.1,
    end: 30,
    group: 2,
    flow: ['Alumina', 'Liquid aluminum', 'Ingots'],
    metrics: [['Energy exposure', 'High'], ['Delivered cost', 'Modeled'], ['Supply risk', 'Elevated']],
  },
  { id: 'inbound', number: '08', title: 'Inbound materials', copy: 'Refined aluminum moves toward the factory floor.', start: 30, end: 32.4, group: 3 },
  { id: 'manufacturing', number: '09', title: 'Manufacturing', copy: 'Raw material becomes the structure of a machine.', start: 32.4, end: 35.4, group: 3 },
  { id: 'robot', start: 35.4, end: HERO_DURATION + 1, group: 3 },
]

export const HERO_LABELS: HeroLabel[] = [
  { anchor: 'mineRegion', text: 'Boké region', lines: ['Guinea', 'Bauxite origin'], from: 5.8, to: 8.8, tone: 'signal' },
  { anchor: 'openPit', text: 'Open-pit mine', from: 8.6, to: 12.2 },
  { anchor: 'extraction', text: 'Ore extraction', from: 9.2, to: 12.2 },
  { anchor: 'stockpile', text: 'Stockpile', from: 9.8, to: 12.4 },
  { anchor: 'haulRoad', text: 'Haul road', from: 10.4, to: 12.4 },
  { anchor: 'convoy', text: 'Truck convoy', from: 12.9, to: 15.2, tone: 'signal' },
  { anchor: 'storage', text: 'Storage area', from: 14.4, to: 16.4 },
  { anchor: 'railConnection', text: 'Rail connection', from: 15.0, to: 16.6 },
  { anchor: 'coastalRoute', text: 'Coastal route', from: 15.4, to: 16.8 },
  { anchor: 'kamsar', text: 'Kamsar', lines: ['Guinea'], from: 16.6, to: 19.4 },
  { anchor: 'portStockpile', text: 'Stockpile', from: 16.9, to: 19.0 },
  { anchor: 'shipLoader', text: 'Ship loader', from: 17.2, to: 18.9 },
  { anchor: 'carrier', text: 'Dry-bulk carrier', from: 17.6, to: 20.2, tone: 'signal' },
  { anchor: 'origin', text: 'Origin', lines: ['Kamsar, GN'], from: 20.6, to: 23.2 },
  { anchor: 'shipPosition', text: 'Vessel', from: 20.8, to: 23.0, tone: 'signal' },
  { anchor: 'destination', text: 'Destination', lines: ['US Gulf'], from: 21.2, to: 23.6 },
  { anchor: 'digestion', text: 'Digestion', from: 24.2, to: 27.0 },
  { anchor: 'clarification', text: 'Clarification', from: 24.6, to: 27.0 },
  { anchor: 'precipitation', text: 'Precipitation', from: 25.0, to: 27.0 },
  { anchor: 'calcination', text: 'Calcination', from: 25.4, to: 27.0 },
  { anchor: 'electrolysis', text: 'Electrolysis cells', from: 27.8, to: 29.9 },
  { anchor: 'casting', text: 'Casting', from: 28.4, to: 29.9 },
  { anchor: 'flatbed', text: 'Aluminum billets', from: 30.4, to: 31.6, tone: 'signal' },
  { anchor: 'destination2', text: 'Robotics manufacturer', from: 31.0, to: 32.6 },
  { anchor: 'rolling', text: 'Rolling', from: 32.8, to: 34.6 },
  { anchor: 'extrusion', text: 'Extrusion', from: 33.0, to: 34.6 },
  { anchor: 'machining', text: 'Machining', from: 33.2, to: 34.8 },
  { anchor: 'assembly', text: 'Assembly', from: 33.4, to: 35.0 },
  { anchor: 'qualityControl', text: 'Quality control', from: 33.6, to: 35.2 },
]

export const HERO_FINAL = {
  headline: ['Here is what', 'can be built.'],
  copy: 'Six robots, each traced part by part to the materials and countries behind it.',
}

export const HERO_OPENING = {
  headline: ['Every robot', 'begins somewhere.'],
  copy: 'Vulcan Trade connects the materials, routes, costs, and risks behind industrial production.',
}

export const LEGEND = ['Bauxite / Aluminum', 'Copper', 'Lithium', 'Nickel', 'Cobalt', 'Rare earths']

export function stageAt(t: number) {
  return HERO_STAGES.find((s) => t >= s.start && t < s.end) ?? HERO_STAGES[HERO_STAGES.length - 1]
}

export function groupAt(t: number) {
  const i = TIMELINE_GROUPS.findIndex((g) => t >= g.start && t < g.end)
  return i < 0 ? TIMELINE_GROUPS.length - 1 : i
}
