export type MaterialId = 'bauxite' | 'copper' | 'lithium' | 'cobalt' | 'iron' | 'nickel' | 'rareEarths'

export type NetworkNode = {
  id: string
  name: string
  country: string
  lat: number
  lng: number
  kind: 'mine'
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


export const CONTACT_EMAIL = 'ram2315@columbia.edu'
export const CONTACT_HREF = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Vulcan Trade')}`
export const LINKEDIN_HREF = `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent('Vulcan Trade')}`

export const PROBLEM = {
  headline: 'The commodities market is over-the-counter and very opaque. We want to change that.',
  copy: 'Manufacturers make critical sourcing decisions across fragmented commodity, supplier, logistics, and market systems.',
  broader: ['The commodity market is opaque.', 'We are building the intelligence layer to change that.'],
  risks: [
    { title: 'Geopolitical events', text: 'Strikes and instability' },
    { title: 'Mine & port disruptions', text: 'Unexpected operational delays' },
    { title: 'Tariffs & export restrictions', text: 'Policy changes that reshape routes and costs' },
    { title: 'Market volatility', text: 'Prices, demand, and availability shift quickly' },
  ],
}

export const SOLUTION = {
  headline: 'See what is changing before it affects production.',
  copy: 'Vulcan Trade connects commodity, supplier, logistics, and market signals to help manufacturers evaluate sourcing options before disruption reaches the factory floor.',
  values: [
    { title: 'Detect early signals', text: 'Surface geopolitical, operational, and policy risks.' },
    { title: 'Compare options', text: 'Evaluate origins, suppliers, routes, costs, and exposure.' },
    { title: 'Make better decisions', text: 'Choose more competitive and resilient supply strategies.' },
  ],
  positioning:
    'Vulcan Trade does not predict the future with certainty. It helps sourcing teams see emerging risks earlier, model possible outcomes, and make better-informed decisions.',
}

export type Founder = { name: string; role: string; bio?: string; photo?: string; linkedin?: string }

/** Drop portraits into /public/team and set `photo` to show them with the site's monochrome treatment. */
export const FOUNDERS: Founder[] = [
  {
    name: 'Raphael Monges',
    role: 'Co-founder & CEO',
    photo: '/team/raphael-monges.webp',
    bio: 'Raphael brings experience in the freight and commodity industry from Navios Maritime. He holds a Master in Business Analytics from Columbia Engineering, a Master in Artificial Intelligence from Centrale Paris, and an MIM from ESCP.',
  },
  { name: 'Wiam Homir', role: 'CTO' },
]

export const TEAM = {
  headline: ['The people building', 'the intelligence layer.'],
  copy: 'With experience across maritime logistics, financial markets, AI, chemical engineering, and business analytics, we are building Vulcan Trade to make commodity supply chains more transparent, predictable, and competitive.',
}

export const FINAL_CTA = {
  headline: ['Make the invisible', 'supply chain visible.'],
  copy: 'Better sourcing decisions begin with a clearer view of what is happening upstream.',
  cta: 'Talk to Vulcan Trade',
}
