const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables from .env.local or .env
require('dotenv').config({ path: path.join(__dirname, '../.env.local') })
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
// Use service role key for full access - prioritize env var, then fallback to hardcoded
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpbXJya3FvZG5iZnl6YnplbWhmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODYyMzU3NSwiZXhwIjoyMDg0MTk5NTc1fQ.npOqex6vBbF1_DdSlFWfXDrC3VkkQA5w56thj05Zj1M'

console.log('🔑 Using Supabase URL:', supabaseUrl)
console.log('🔑 Using key:', supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'NOT FOUND')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials!')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
  console.error('Current values:')
  console.error('  SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
  console.error('  SUPABASE_KEY:', supabaseKey ? '✓' : '✗')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

function parseDate(dateStr) {
  if (!dateStr || dateStr === 'unknown' || dateStr === '' || dateStr.includes('unknown')) {
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
  
  // Try to parse as-is, but return null if invalid
  try {
    const cleanDate = dateStr.split(' ')[0]
    // If it's just a year like "2010", return null (PostgreSQL needs full date)
    if (/^\d{4}$/.test(cleanDate)) {
      return null
    }
    const date = new Date(cleanDate)
    if (isNaN(date.getTime())) {
      return null
    }
    return cleanDate
  } catch {
    return null
  }
}

function extractCompany(operator) {
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

function determineCommodity(site) {
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

function determineLocationType(site) {
  const name = site.site_name.toLowerCase()
  if (name.includes('gas') && name.includes('oil')) {
    return 'oil_and_gas_field'
  }
  if (name.includes('gas')) {
    return 'gas_field'
  }
  return 'oil_field'
}

function transformSite(site) {
  const commodity = determineCommodity(site)
  const locationType = determineLocationType(site)
  // Map status to allowed values: 'operational', 'under_construction', 'planned', 'inactive', 'depleted', 'active'
  let status = 'inactive'
  if (site.status === 'active') {
    status = 'active'
  } else if (site.status === 'closed') {
    status = 'inactive' // Map 'closed' to 'inactive' since 'closed' isn't in the constraint
  }
  const company = extractCompany(site.operator)
  
  // Normalize ownership_type to match constraint
  let ownershipType = site.ownership_type || 'unknown'
  // Map Angola-specific ownership types
  if (ownershipType === 'JV concession (Block 0 Association)') {
    ownershipType = 'JV (concession / joint participation)'
  }
  // If ownership_type doesn't match constraint, use a default
  const allowedOwnershipTypes = [
    'private', 'public', 'state_owned', 'joint_venture', 'state-owned',
    'JV', 'PSC', 'JV / PSC', 'JV/PSC', 'PSC / JV', 'PSC/JV',
    'JV / PSC-style partnership', 'JV / PSC (historical)',
    'JV (Sonatrach with foreign partners)', 'JV / PSC / Unitized (multi-block)',
    'Unitized JV / PSC', 'Production Sharing-style partnership with Sonatrach (national company)',
    'JV / Production Sharing-style partnership with Sonatrach (national company)',
    'state-owned (project history includes terminated foreign LNG development contract)',
    'JV (concession / joint participation)', 'JV (exploration block participants)', 'unknown'
  ]
  
  // If ownership_type is not in allowed list, use 'joint_venture' as default for JV types
  if (!allowedOwnershipTypes.includes(ownershipType)) {
    if (ownershipType.toLowerCase().includes('jv') || ownershipType.toLowerCase().includes('joint') || ownershipType.toLowerCase().includes('concession')) {
      ownershipType = 'joint_venture'
    } else {
      ownershipType = 'unknown'
    }
  }
  
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
    ownership_type: ownershipType,
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
    last_transaction_date: site.last_transaction_date ? parseDate(site.last_transaction_date) : null,
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
  const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
  
  console.log(`📊 Found ${jsonData.sites.length} sites in JSON file\n`)
  
  // Delete existing Angola entries
  console.log('🗑️  Deleting existing Angola entries...')
  const { error: deleteError, count: deleteCount } = await supabase
    .from('commodity_locations')
    .delete()
    .eq('country', 'Angola')
  
  if (deleteError) {
    console.error('❌ Error deleting existing entries:', deleteError.message)
    // Try to continue anyway - maybe RLS doesn't allow delete
    console.log('⚠️  Continuing with insert (some entries may already exist)...\n')
  } else {
    console.log(`✅ Deleted ${deleteCount || 'existing'} Angola entries\n`)
  }
  
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
    
    // Try to insert, and if duplicate, try upsert or skip
    const { error } = await supabase
      .from('commodity_locations')
      .insert(transformedBatch)
    
    if (error) {
      // If duplicate key error, try inserting one by one to skip duplicates
      if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
        console.log(`⚠️  Batch ${Math.floor(i / batchSize) + 1} has duplicates, inserting individually...`)
        for (let j = 0; j < transformedBatch.length; j++) {
          const { error: singleError } = await supabase
            .from('commodity_locations')
            .insert([transformedBatch[j]])
          
          if (singleError && !singleError.message.includes('duplicate') && !singleError.message.includes('unique constraint')) {
            console.error(`  ❌ ${batch[j].site_name}: ${singleError.message}`)
            errorCount++
          } else if (!singleError) {
            successCount++
          } else {
            // Duplicate - skip it
            console.log(`  ⏭️  Skipped duplicate: ${batch[j].site_name}`)
          }
        }
      } else {
        console.error(`❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error.message)
        console.error('Failed sites:', batch.map(s => s.site_name).join(', '))
        errorCount += batch.length
      }
    } else {
      console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1} (${batch.length} sites)`)
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
