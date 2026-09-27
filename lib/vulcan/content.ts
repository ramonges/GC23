export type MaterialId =
  | 'bauxite'
  | 'copper'
  | 'lithium'
  | 'cobalt'
  | 'iron'
  | 'nickel'
  | 'rareEarths'

export type Material = {
  id: MaterialId
  label: string
  color: string
}

export const MATERIALS: Material[] = [
  { id: 'bauxite', label: 'Bauxite / Aluminum', color: '#F28C38' },
  { id: 'copper', label: 'Copper', color: '#C8794A' },
  { id: 'lithium', label: 'Lithium', color: '#4E9BFF' },
  { id: 'cobalt', label: 'Cobalt', color: '#9B7BFF' },
  { id: 'iron', label: 'Iron ore', color: '#E5484D' },
  { id: 'nickel', label: 'Nickel', color: '#3FB884' },
  { id: 'rareEarths', label: 'Rare earth elements', color: '#E6D29A' },
]

export const MATERIAL_BY_ID = Object.fromEntries(MATERIALS.map((m) => [m.id, m])) as Record<MaterialId, Material>

export type NodeKind = 'mine' | 'port' | 'processing' | 'manufacturing'

export type NetworkNode = {
  id: string
  name: string
  country: string
  lat: number
  lng: number
  kind: NodeKind
  facility: string
  material?: MaterialId
  nextRoute?: string
}

export const MINES: NetworkNode[] = [
  { id: 'boke', name: 'Boké (Sangarédi)', country: 'Guinea', lat: 11.1, lng: -13.78, kind: 'mine', material: 'bauxite', facility: 'Open-pit bauxite mine', nextRoute: 'Rail → Kamsar Port' },
  { id: 'kindia', name: 'Kindia (Débélé)', country: 'Guinea', lat: 10.13, lng: -12.95, kind: 'mine', material: 'bauxite', facility: 'Open-pit bauxite mine', nextRoute: 'Rail → Conakry Port' },
  { id: 'weipa', name: 'Weipa', country: 'Australia', lat: -12.68, lng: 141.92, kind: 'mine', material: 'bauxite', facility: 'Bauxite mine', nextRoute: 'Ship → Gladstone alumina refineries' },
  { id: 'escondida', name: 'Escondida', country: 'Chile', lat: -24.27, lng: -69.07, kind: 'mine', material: 'copper', facility: 'Open-pit copper mine', nextRoute: 'Concentrate pipeline → Coloso, Antofagasta' },
  { id: 'kamoa', name: 'Kamoa-Kakula', country: 'DR Congo', lat: -10.77, lng: 25.28, kind: 'mine', material: 'copper', facility: 'Underground copper mine', nextRoute: 'Road & rail → Durban Port' },
  { id: 'grasberg', name: 'Grasberg', country: 'Indonesia', lat: -4.06, lng: 137.12, kind: 'mine', material: 'copper', facility: 'Copper-gold mine', nextRoute: 'Slurry pipeline → Amamapare Port' },
  { id: 'atacama', name: 'Salar de Atacama', country: 'Chile', lat: -23.5, lng: -68.25, kind: 'mine', material: 'lithium', facility: 'Lithium brine operations', nextRoute: 'Truck → La Negra processing, Antofagasta' },
  { id: 'greenbushes', name: 'Greenbushes', country: 'Australia', lat: -33.86, lng: 116.06, kind: 'mine', material: 'lithium', facility: 'Hard-rock spodumene mine', nextRoute: 'Truck → Kwinana hydroxide refining' },
  { id: 'kolwezi', name: 'Kolwezi', country: 'DR Congo', lat: -10.72, lng: 25.47, kind: 'mine', material: 'cobalt', facility: 'Copper-cobalt mining district', nextRoute: 'Road → Dar es Salaam Port' },
  { id: 'tenke', name: 'Tenke Fungurume', country: 'DR Congo', lat: -10.58, lng: 26.18, kind: 'mine', material: 'cobalt', facility: 'Copper-cobalt mine', nextRoute: 'Road → Durban Port' },
  { id: 'pilbara', name: 'Pilbara (Newman)', country: 'Australia', lat: -23.36, lng: 119.73, kind: 'mine', material: 'iron', facility: 'Open-pit iron ore mine', nextRoute: 'Rail → Port Hedland' },
  { id: 'carajas', name: 'Carajás', country: 'Brazil', lat: -6.07, lng: -50.17, kind: 'mine', material: 'iron', facility: 'Open-pit iron ore mine', nextRoute: 'Rail → Ponta da Madeira, São Luís' },
  { id: 'simandou', name: 'Simandou', country: 'Guinea', lat: 8.55, lng: -8.9, kind: 'mine', material: 'iron', facility: 'Iron ore project', nextRoute: 'Rail → Morebaya Port' },
  { id: 'morowali', name: 'Morowali, Sulawesi', country: 'Indonesia', lat: -2.85, lng: 122.15, kind: 'mine', material: 'nickel', facility: 'Nickel mining & processing park', nextRoute: 'Ship → Shanghai' },
  { id: 'norilsk', name: 'Norilsk', country: 'Russia', lat: 69.35, lng: 88.2, kind: 'mine', material: 'nickel', facility: 'Nickel-palladium mining complex', nextRoute: 'Rail & river → Dudinka Port' },
  { id: 'sudbury', name: 'Sudbury Basin', country: 'Canada', lat: 46.49, lng: -81.0, kind: 'mine', material: 'nickel', facility: 'Nickel-copper mining district', nextRoute: 'Rail → smelting & refining' },
  { id: 'bayanobo', name: 'Bayan Obo', country: 'China', lat: 41.78, lng: 109.97, kind: 'mine', material: 'rareEarths', facility: 'Rare earth mine', nextRoute: 'Rail → Baotou separation' },
  { id: 'mountainpass', name: 'Mountain Pass', country: 'United States', lat: 35.48, lng: -115.53, kind: 'mine', material: 'rareEarths', facility: 'Rare earth mine & processing', nextRoute: 'Truck → magnet supply chain' },
  { id: 'mountweld', name: 'Mount Weld', country: 'Australia', lat: -28.86, lng: 122.55, kind: 'mine', material: 'rareEarths', facility: 'Rare earth mine', nextRoute: 'Road → Kalgoorlie → Kuantan, Malaysia' },
]

export const HUBS: NetworkNode[] = [
  { id: 'kamsar', name: 'Kamsar Port', country: 'Guinea', lat: 10.65, lng: -14.61, kind: 'port', facility: 'Bauxite export port' },
  { id: 'antofagasta', name: 'Antofagasta', country: 'Chile', lat: -23.65, lng: -70.4, kind: 'port', facility: 'Copper & lithium export port' },
  { id: 'porthedland', name: 'Port Hedland', country: 'Australia', lat: -20.31, lng: 118.58, kind: 'port', facility: 'Iron ore export port' },
  { id: 'saoluis', name: 'São Luís', country: 'Brazil', lat: -2.57, lng: -44.37, kind: 'port', facility: 'Iron ore export port' },
  { id: 'daressalaam', name: 'Dar es Salaam', country: 'Tanzania', lat: -6.82, lng: 39.29, kind: 'port', facility: 'Cobalt & copper export port' },
  { id: 'durban', name: 'Durban', country: 'South Africa', lat: -29.87, lng: 31.03, kind: 'port', facility: 'Copper & cobalt export port' },
  { id: 'qingdao', name: 'Qingdao', country: 'China', lat: 36.07, lng: 120.38, kind: 'port', facility: 'Bulk import port' },
  { id: 'rotterdam', name: 'Rotterdam', country: 'Netherlands', lat: 51.95, lng: 4.14, kind: 'port', facility: 'Bulk import port' },
  { id: 'gladstone', name: 'Gladstone', country: 'Australia', lat: -23.84, lng: 151.26, kind: 'processing', facility: 'Alumina refining' },
  { id: 'shandong', name: 'Shandong', country: 'China', lat: 37.38, lng: 117.97, kind: 'processing', facility: 'Alumina & aluminum smelting' },
  { id: 'kwinana', name: 'Kwinana', country: 'Australia', lat: -32.23, lng: 115.78, kind: 'processing', facility: 'Lithium hydroxide refining' },
  { id: 'baotou', name: 'Baotou', country: 'China', lat: 40.66, lng: 109.84, kind: 'processing', facility: 'Rare earth separation' },
  { id: 'kuantan', name: 'Kuantan', country: 'Malaysia', lat: 3.97, lng: 103.43, kind: 'processing', facility: 'Rare earth processing' },
  { id: 'shanghai', name: 'Shanghai', country: 'China', lat: 31.14, lng: 121.58, kind: 'manufacturing', facility: 'Robotics manufacturing cluster' },
  { id: 'yamanashi', name: 'Yamanashi', country: 'Japan', lat: 35.47, lng: 138.87, kind: 'manufacturing', facility: 'Robotics manufacturing cluster' },
  { id: 'kitakyushu', name: 'Kitakyushu', country: 'Japan', lat: 33.88, lng: 130.88, kind: 'manufacturing', facility: 'Robotics manufacturing cluster' },
  { id: 'augsburg', name: 'Augsburg', country: 'Germany', lat: 48.37, lng: 10.89, kind: 'manufacturing', facility: 'Robotics manufacturing cluster' },
  { id: 'detroit', name: 'Detroit', country: 'United States', lat: 42.33, lng: -83.05, kind: 'manufacturing', facility: 'Industrial automation cluster' },
]

export const NODE_BY_ID = Object.fromEntries([...MINES, ...HUBS].map((n) => [n.id, n])) as Record<string, NetworkNode>

export type RouteKind = 'export' | 'ocean' | 'delivery'

export type NetworkRoute = {
  from: string
  to: string
  material: MaterialId
  kind: RouteKind
}

export const ROUTES: NetworkRoute[] = [
  { from: 'boke', to: 'kamsar', material: 'bauxite', kind: 'export' },
  { from: 'kamsar', to: 'qingdao', material: 'bauxite', kind: 'ocean' },
  { from: 'qingdao', to: 'shandong', material: 'bauxite', kind: 'ocean' },
  { from: 'shandong', to: 'shanghai', material: 'bauxite', kind: 'delivery' },
  { from: 'weipa', to: 'gladstone', material: 'bauxite', kind: 'ocean' },
  { from: 'gladstone', to: 'kitakyushu', material: 'bauxite', kind: 'delivery' },
  { from: 'escondida', to: 'antofagasta', material: 'copper', kind: 'export' },
  { from: 'antofagasta', to: 'shanghai', material: 'copper', kind: 'ocean' },
  { from: 'kamoa', to: 'durban', material: 'copper', kind: 'export' },
  { from: 'durban', to: 'rotterdam', material: 'copper', kind: 'ocean' },
  { from: 'atacama', to: 'antofagasta', material: 'lithium', kind: 'export' },
  { from: 'greenbushes', to: 'kwinana', material: 'lithium', kind: 'export' },
  { from: 'kwinana', to: 'yamanashi', material: 'lithium', kind: 'delivery' },
  { from: 'kolwezi', to: 'daressalaam', material: 'cobalt', kind: 'export' },
  { from: 'daressalaam', to: 'shanghai', material: 'cobalt', kind: 'ocean' },
  { from: 'pilbara', to: 'porthedland', material: 'iron', kind: 'export' },
  { from: 'porthedland', to: 'qingdao', material: 'iron', kind: 'ocean' },
  { from: 'carajas', to: 'saoluis', material: 'iron', kind: 'export' },
  { from: 'saoluis', to: 'rotterdam', material: 'iron', kind: 'ocean' },
  { from: 'rotterdam', to: 'augsburg', material: 'iron', kind: 'delivery' },
  { from: 'morowali', to: 'shanghai', material: 'nickel', kind: 'ocean' },
  { from: 'sudbury', to: 'detroit', material: 'nickel', kind: 'delivery' },
  { from: 'bayanobo', to: 'baotou', material: 'rareEarths', kind: 'export' },
  { from: 'baotou', to: 'yamanashi', material: 'rareEarths', kind: 'delivery' },
  { from: 'mountweld', to: 'kuantan', material: 'rareEarths', kind: 'ocean' },
  { from: 'mountainpass', to: 'detroit', material: 'rareEarths', kind: 'delivery' },
]

export type HeroStage = {
  id: string
  number: string
  label: string
  headline: string
  line: string
}

export const HERO_STAGES: HeroStage[] = [
  {
    id: 'origins',
    number: '01',
    label: 'Material origins',
    headline: 'Every robot begins somewhere.',
    line: 'Trace the raw materials, routes, risks, and decisions behind industrial production.',
  },
  {
    id: 'routes',
    number: '02',
    label: 'Routes',
    headline: 'Every material travels.',
    line: 'Mines connect to ports, ports to refineries, refineries to factories — across oceans and borders.',
  },
  {
    id: 'transformation',
    number: '03',
    label: 'Transformation',
    headline: 'Ore becomes alloy.',
    line: 'Refining and smelting turn raw tonnage into the metals, cells, and magnets machines depend on.',
  },
  {
    id: 'robotics',
    number: '04',
    label: 'Robotics',
    headline: 'Alloy becomes motion.',
    line: 'Every actuator, battery, and magnet carries a supply chain. Vulcan Trade makes it visible.',
  },
]

export const CYCLING_MATERIALS = ['Bauxite.', 'Copper.', 'Lithium.', 'Rare earths.']

export const CONTACT_EMAIL = 'ram2315@columbia.edu'
export const CONTACT_HREF = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Vulcan Trade')}`

export type Founder = {
  name: string
  credential: string
  photo?: string
  linkedin?: string
}

// Fill in with real founder details; the section hides the grid while empty.
export const FOUNDERS: Founder[] = []

export type PressItem = {
  outlet: string
  quote?: string
  href?: string
}

export const PRESS: PressItem[] = []
