import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials!')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

interface AngolaSite {
  site_name: string
  country: string
  state_province: string
  latitude: number | null
  longitude: number | null
  status: string
  start_date: string | null
  closing_date: string | null
  production_monthly: number
  production_yearly: number
  production_unit: string
  operator: string
  ownership_type: string
  ownership_details: string
  estimated_reserves: number
  reserves_unit: string
  quality_api_gravity: number | null
  quality_type: string | null
  quality_sulfur_content: number | null
  quality_grade_percent: number | null
  last_transaction_value: number | null
  last_transaction_currency: string
  last_transaction_date: string | null
  contract_duration_years: number | null
  pipelines: string[]
  ports: string[]
  rail_connections: string[]
}

interface AngolaData {
  country: string
  total_sites: number
  generated_date: string
  sites: AngolaSite[]
}

function parseDate(dateStr: string | null): string | null {
  if (!dateStr || dateStr === 'unknown' || dateStr === '') {
    return null
  }
  
  // Handle formats like "2009-11 (spud; exploration)"
  const match = dateStr.match(/^(\d{4})-(\d{2})/)
  if (match) {
    return `${match[1]}-${match[2]}-01`
  }
  
  // Handle YYYY format
  if (/^\d{4}$/.test(dateStr)) {
    return `${dateStr}-01-01`
  }
  
  // Try to parse as-is
  try {
    new Date(dateStr)
    return dateStr.split(' ')[0] // Take first part if there's extra text
  } catch {
    return null
  }
}

function extractCompany(operator: string): string | null {
  if (!operator || operator === 'unknown') {
    return null
  }
  const opLower = operator.toLowerCase()
  if (opLower.includes('chevron') || opLower.includes('cabgoc')) {
    return 'Chevron'
  }
  if (opLower.includes('total') || opLower.includes('totalenergies')) {
    return 'TotalEnergies'
  }
  if (opLower.includes('exxon') || opLower.includes('esso')) {
    return 'ExxonMobil'
  }
  if (opLower.includes('bp')) {
    return 'BP'
  }
  if (opLower.includes('pluspetrol')) {
    return 'Pluspetrol'
  }
  if (opLower.includes('sonangol')) {
    return 'Sonangol'
  }
  if (opLower.includes('cobalt')) {
    return 'Cobalt International Energy'
  }
  return null
}

function determineCommodity(site: AngolaSite): string {
  const name = site.site_name.toLowerCase()
  const quality = (site.quality_type || '').toLowerCase()
  if (name.includes('gas') && !name.includes('oil')) {
    return 'Natural Gas'
  }
  if (quality.includes('gas') && !quality.includes('oil')) {
    return 'Natural Gas'
  }
  return 'Crude Oil'
}

function determineLocationType(site: AngolaSite): string {
  const name = site.site_name.toLowerCase()
  if (name.includes('gas') && name.includes('oil')) {
    return 'oil_and_gas_field'
  }
  if (name.includes('gas')) {
    return 'gas_field'
  }
  return 'oil_field'
}

function transformSite(site: AngolaSite): any {
  const commodity = determineCommodity(site)
  const locationType = determineLocationType(site)
  const status = site.status === 'active' ? 'active' : site.status === 'closed' ? 'closed' : 'inactive'
  const company = extractCompany(site.operator)
  
  let grade = null
  if (site.quality_type) {
    const qtLower = site.quality_type.toLowerCase()
    if (qtLower.includes('light') || qtLower.includes('sweet')) {
      grade = site.quality_type.split('(')[0].trim()
    }
  }
  
  return {
    title: site.site_name,
    owner: site.operator || 'unknown',
    address: `${site.state_province}, Angola`,
    country: 'Angola',
    region: site.state_province,
    latitude: site.latitude,
    longitude: site.longitude,
    commodity_type: 'Energy',
    commodity_name: commodity,
    location_type: locationType,
    operational_status: status,
    operator: site.operator || 'unknown',
    ownership_type: site.ownership_type,
    ownership_details: site.ownership_details,
    production_monthly: site.production_monthly || 0,
    production_yearly: site.production_yearly || 0,
    production_unit: site.production_unit || '',
    current_production: site.production_yearly || 0,
    reserves_estimate: site.estimated_reserves || 0,
    reserves_unit: site.reserves_unit || '',
    start_date: parseDate(site.start_date),
    closing_date: parseDate(site.closing_date),
    api_gravity: site.quality_api_gravity,
    quality_type: site.quality_type || null,
    quality_sulfur_content: site.quality_sulfur_content,
    grade: grade,
    last_transaction_value: site.last_transaction_value,
    last_transaction_currency: site.last_transaction_currency || 'USD',
    last_transaction_date: parseDate(site.last_transaction_date),
    contract_duration_years: site.contract_duration_years,
    pipelines: site.pipelines || [],
    ports: site.ports || [],
    rail_connections: site.rail_connections || [],
    company: company,
    additional_info: {
      source: 'Angola_all_sites.json',
      generated_date: new Date().toISOString()
    }
  }
}

async function insertAngolaFields() {
  console.log('🇦🇴 Starting Angola fields import...\n')
  
  // Read JSON file
  const jsonPath = path.join(__dirname, '../Angola_all_sites_with_coordinates.json')
  const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8')) as AngolaData
  
  console.log(`📊 Found ${jsonData.sites.length} sites in JSON file\n`)
  
  // Delete existing Angola entries
  console.log('🗑️  Deleting existing Angola entries...')
  const { error: deleteError } = await supabase
    .from('commodity_locations')
    .delete()
    .eq('country', 'Angola')
  
  if (deleteError) {
    console.error('❌ Error deleting existing entries:', deleteError.message)
    return
  }
  console.log('✅ Deleted existing Angola entries\n')
  
  // Insert companies first
  console.log('🏢 Inserting/updating companies...')
  const companies = [
    { name: 'Chevron', type: 'producer', headquarters_country: 'United States', commodities_traded: ['Crude Oil', 'Natural Gas'] },
    { name: 'TotalEnergies', type: 'producer', headquarters_country: 'France', commodities_traded: ['Crude Oil', 'Natural Gas'] },
    { name: 'ExxonMobil', type: 'producer', headquarters_country: 'United States', commodities_traded: ['Crude Oil', 'Natural Gas'] },
    { name: 'BP', type: 'producer', headquarters_country: 'United Kingdom', commodities_traded: ['Crude Oil', 'Natural Gas'] },
    { name: 'Pluspetrol', type: 'producer', headquarters_country: 'Argentina', commodities_traded: ['Crude Oil', 'Natural Gas'] },
    { name: 'Sonangol', type: 'producer', headquarters_country: 'Angola', commodities_traded: ['Crude Oil', 'Natural Gas'] },
    { name: 'Cobalt International Energy', type: 'producer', headquarters_country: 'United States', commodities_traded: ['Crude Oil', 'Natural Gas'] }
  ]
  
  for (const company of companies) {
    const { error } = await supabase
      .from('companies')
      .upsert(company, { onConflict: 'name' })
    
    if (error) {
      console.error(`⚠️  Error upserting company ${company.name}:`, error.message)
    }
  }
  console.log('✅ Companies inserted/updated\n')
  
  // Transform and insert sites
  console.log('📝 Inserting Angola sites...')
  let successCount = 0
  let errorCount = 0
  
  // Filter sites with coordinates
  const sitesWithCoords = jsonData.sites.filter(s => s.latitude != null && s.longitude != null)
  console.log(`📍 ${sitesWithCoords.length} sites have coordinates\n`)
  
  // Insert in batches of 10
  const batchSize = 10
  for (let i = 0; i < sitesWithCoords.length; i += batchSize) {
    const batch = sitesWithCoords.slice(i, i + batchSize)
    const transformedBatch = batch.map(transformSite)
    
    const { error } = await supabase
      .from('commodity_locations')
      .insert(transformedBatch)
    
    if (error) {
      console.error(`❌ Error inserting batch ${i / batchSize + 1}:`, error.message)
      console.error('Failed sites:', batch.map(s => s.site_name).join(', '))
      errorCount += batch.length
    } else {
      console.log(`✅ Inserted batch ${i / batchSize + 1} (${batch.length} sites)`)
      successCount += batch.length
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200))
  }
  
  console.log('\n📊 Import Summary:')
  console.log(`   ✅ Successful: ${successCount}`)
  console.log(`   ❌ Errors: ${errorCount}`)
  console.log(`   📝 Total: ${sitesWithCoords.length}`)
  
  // Verification query
  const { count } = await supabase
    .from('commodity_locations')
    .select('*', { count: 'exact', head: true })
    .eq('country', 'Angola')
  
  console.log(`\n🔍 Verification: ${count} Angola sites in database`)
}

// Run the import
insertAngolaFields()
  .then(() => {
    console.log('\n✅ Import completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  })
