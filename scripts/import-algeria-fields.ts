import fs from 'fs'
import path from 'path'

interface AlgeriaSite {
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
  quality_type: string
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

interface AlgeriaData {
  country: string
  total_sites: number
  generated_date: string
  sites: AlgeriaSite[]
}

function parseDate(dateStr: string | null): string {
  if (!dateStr || dateStr === 'unknown' || dateStr === '') return 'NULL'
  if (/^\d{4}$/.test(dateStr)) return `parse_site_date('${dateStr}')`
  if (/^\d{4}-\d{2}$/.test(dateStr)) return `parse_site_date('${dateStr}')`
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return `parse_site_date('${dateStr}')`
  if (dateStr === '1900-01-01') return 'NULL'
  return `parse_site_date('${dateStr}')`
}

function extractPrimaryCompany(operator: string): string {
  if (!operator || operator === 'unknown') return 'NULL'
  if (operator.includes('Sonatrach')) return "'Sonatrach'"
  if (operator.includes('Cepsa')) return "'Cepsa'"
  if (operator.includes('Eni')) return "'Eni'"
  if (operator.includes('Occidental') || operator.includes('Oxy') || operator.includes('Anadarko')) return "'Occidental Petroleum'"
  if (operator.includes('Total') || operator.includes('TotalEnergies')) return "'TotalEnergies'"
  if (operator.includes('Repsol')) return "'Repsol'"
  if (operator.includes('BP')) return "'BP'"
  if (operator.includes('PTTEP')) return "'PTTEP'"
  if (operator.includes('Petrovietnam')) return "'Petrovietnam'"
  if (operator.includes('Wintershall')) return "'Wintershall Dea'"
  if (operator.includes('Groupement Berkine')) return "'Groupement Berkine'"
  if (operator.includes('Organisation Ourhoud')) return "'Organisation Ourhoud'"
  if (operator.includes('Groupement Reggane Nord') || operator.includes('GRN')) return "'Groupement Reggane Nord'"
  if (operator.includes('Groupement Isarene')) return "'Groupement Isarene'"
  return 'NULL'
}

function determineCommodityType(site: AlgeriaSite): string {
  const name = site.site_name.toLowerCase()
  const qualityType = site.quality_type?.toLowerCase() || ''
  
  if (name.includes('gas') && !name.includes('oil')) return 'Natural Gas'
  if (qualityType.includes('gas') && !qualityType.includes('oil')) return 'Natural Gas'
  if (name.includes('oil') || qualityType.includes('crude') || qualityType.includes('oil')) return 'Crude Oil'
  return 'Crude Oil' // Default
}

function determineLocationType(site: AlgeriaSite): string {
  const name = site.site_name.toLowerCase()
  if (name.includes('gas') && name.includes('oil')) return 'oil_and_gas_field'
  if (name.includes('gas') && !name.includes('oil')) return 'gas_field'
  return 'oil_field'
}

function mapStatus(status: string): string {
  if (status === 'active') return 'active'
  return 'inactive'
}

function escapeSqlString(str: string | null): string {
  if (!str) return 'NULL'
  return `'${str.replace(/'/g, "''")}'`
}

function formatArray(arr: string[] | null | undefined): string {
  if (!arr || arr.length === 0) return "ARRAY[]::TEXT[]"
  return `ARRAY[${arr.map(s => `'${s.replace(/'/g, "''")}'`).join(', ')}]`
}

function generateSQL(data: AlgeriaData): string {
  let sql = `-- ============================================
-- COMPLETE ALGERIA OIL FIELDS IMPORT (${data.total_sites} sites)
-- Generated from: Algeria_all_sites.json
-- Generated date: ${data.generated_date}
-- ============================================

-- Helper function to parse date strings
CREATE OR REPLACE FUNCTION parse_site_date(date_str TEXT)
RETURNS DATE AS $$
BEGIN
  IF date_str IS NULL OR date_str = 'unknown' OR date_str = '' THEN
    RETURN NULL;
  END IF;
  
  BEGIN
    RETURN date_str::DATE;
  EXCEPTION WHEN OTHERS THEN
    IF date_str ~ '^\\d{4}$' THEN
      RETURN (date_str || '-01-01')::DATE;
    END IF;
    IF date_str ~ '^\\d{4}-\\d{2}$' THEN
      RETURN (date_str || '-01')::DATE;
    END IF;
    RETURN NULL;
  END;
END;
$$ LANGUAGE plpgsql;

-- Function to extract primary company name from operator string
CREATE OR REPLACE FUNCTION extract_primary_company(operator_text TEXT)
RETURNS TEXT AS $$
BEGIN
  IF operator_text IS NULL OR operator_text = '' THEN
    RETURN NULL;
  END IF;
  
  IF operator_text ILIKE '%Sonatrach%' THEN
    RETURN 'Sonatrach';
  END IF;
  IF operator_text ILIKE '%Cepsa%' THEN
    RETURN 'Cepsa';
  END IF;
  IF operator_text ILIKE '%Eni%' THEN
    RETURN 'Eni';
  END IF;
  IF operator_text ILIKE '%Occidental%' OR operator_text ILIKE '%Oxy%' OR operator_text ILIKE '%Anadarko%' THEN
    RETURN 'Occidental Petroleum';
  END IF;
  IF operator_text ILIKE '%Total%' OR operator_text ILIKE '%TotalEnergies%' THEN
    RETURN 'TotalEnergies';
  END IF;
  IF operator_text ILIKE '%Repsol%' THEN
    RETURN 'Repsol';
  END IF;
  IF operator_text ILIKE '%BP%' THEN
    RETURN 'BP';
  END IF;
  IF operator_text ILIKE '%PTTEP%' THEN
    RETURN 'PTTEP';
  END IF;
  IF operator_text ILIKE '%Petrovietnam%' THEN
    RETURN 'Petrovietnam';
  END IF;
  IF operator_text ILIKE '%Wintershall%' THEN
    RETURN 'Wintershall Dea';
  END IF;
  IF operator_text ILIKE '%Groupement Berkine%' THEN
    RETURN 'Groupement Berkine';
  END IF;
  IF operator_text ILIKE '%Organisation Ourhoud%' THEN
    RETURN 'Organisation Ourhoud';
  END IF;
  IF operator_text ILIKE '%Groupement Reggane Nord%' OR operator_text ILIKE '%GRN%' THEN
    RETURN 'Groupement Reggane Nord';
  END IF;
  IF operator_text ILIKE '%Groupement Isarene%' THEN
    RETURN 'Groupement Isarene';
  END IF;
  
  RETURN SPLIT_PART(SPLIT_PART(operator_text, '/', 1), '(', 1);
END;
$$ LANGUAGE plpgsql;

-- Insert/update companies from operators
INSERT INTO public.companies (name, type, headquarters_country, commodities_traded)
VALUES
  ('Sonatrach', 'producer', 'Algeria', ARRAY['Crude Oil', 'Natural Gas']),
  ('Cepsa', 'producer', 'Spain', ARRAY['Crude Oil', 'Natural Gas']),
  ('Eni', 'producer', 'Italy', ARRAY['Crude Oil', 'Natural Gas']),
  ('Occidental Petroleum', 'producer', 'United States', ARRAY['Crude Oil', 'Natural Gas']),
  ('TotalEnergies', 'producer', 'France', ARRAY['Crude Oil', 'Natural Gas']),
  ('Repsol', 'producer', 'Spain', ARRAY['Crude Oil', 'Natural Gas']),
  ('BP', 'producer', 'United Kingdom', ARRAY['Crude Oil', 'Natural Gas']),
  ('PTTEP', 'producer', 'Thailand', ARRAY['Crude Oil', 'Natural Gas']),
  ('Petrovietnam', 'producer', 'Vietnam', ARRAY['Crude Oil', 'Natural Gas']),
  ('Wintershall Dea', 'producer', 'Germany', ARRAY['Crude Oil', 'Natural Gas']),
  ('Groupement Berkine', 'producer', 'Algeria', ARRAY['Crude Oil']),
  ('Organisation Ourhoud', 'producer', 'Algeria', ARRAY['Crude Oil']),
  ('Groupement Reggane Nord', 'producer', 'Algeria', ARRAY['Natural Gas']),
  ('Groupement Isarene', 'producer', 'Algeria', ARRAY['Natural Gas'])
ON CONFLICT (name) DO UPDATE SET
  commodities_traded = EXCLUDED.commodities_traded;

-- Delete existing Algeria entries to avoid duplicates
DELETE FROM public.commodity_locations WHERE country = 'Algeria';

-- Insert all Algeria sites
INSERT INTO public.commodity_locations (
  title,
  owner,
  address,
  country,
  region,
  latitude,
  longitude,
  commodity_type,
  commodity_name,
  location_type,
  operational_status,
  operator,
  ownership_type,
  ownership_details,
  production_monthly,
  production_yearly,
  production_unit,
  current_production,
  reserves_estimate,
  reserves_unit,
  start_date,
  closing_date,
  api_gravity,
  quality_type,
  quality_sulfur_content,
  grade,
  last_transaction_value,
  last_transaction_currency,
  last_transaction_date,
  contract_duration_years,
  pipelines,
  ports,
  rail_connections,
  company,
  additional_info
) VALUES
`

  const values = data.sites.map((site, index) => {
    const commodityType = determineCommodityType(site)
    const locationType = determineLocationType(site)
    const status = mapStatus(site.status)
    const company = extractPrimaryCompany(site.operator)
    
    return `(
  ${escapeSqlString(site.site_name)},
  ${escapeSqlString(site.operator || 'unknown')},
  ${escapeSqlString(`${site.state_province}, Algeria`)},
  'Algeria',
  ${escapeSqlString(site.state_province)},
  ${site.latitude !== null ? site.latitude : 'NULL'},
  ${site.longitude !== null ? site.longitude : 'NULL'},
  'Energy',
  ${escapeSqlString(commodityType)},
  ${escapeSqlString(locationType)},
  ${escapeSqlString(status)},
  ${escapeSqlString(site.operator || 'unknown')},
  ${escapeSqlString(site.ownership_type)},
  ${escapeSqlString(site.ownership_details)},
  ${site.production_monthly || 0},
  ${site.production_yearly || 0},
  ${escapeSqlString(site.production_unit)},
  ${site.production_yearly || 0},
  ${site.estimated_reserves || 0},
  ${escapeSqlString(site.reserves_unit)},
  ${parseDate(site.start_date)},
  ${parseDate(site.closing_date)},
  ${site.quality_api_gravity !== null ? site.quality_api_gravity : 'NULL'},
  ${escapeSqlString(site.quality_type)},
  ${site.quality_sulfur_content !== null ? site.quality_sulfur_content : 'NULL'},
  ${site.quality_type?.toLowerCase().includes('light') || site.quality_type?.toLowerCase().includes('sweet') ? escapeSqlString(site.quality_type.split('(')[0].trim()) : 'NULL'},
  ${site.last_transaction_value !== null ? site.last_transaction_value : 'NULL'},
  ${escapeSqlString(site.last_transaction_currency || 'USD')},
  ${parseDate(site.last_transaction_date)},
  ${site.contract_duration_years !== null ? site.contract_duration_years : 'NULL'},
  ${formatArray(site.pipelines)},
  ${formatArray(site.ports)},
  ${formatArray(site.rail_connections)},
  ${company},
  '{"source": "Algeria_all_sites.json", "generated_date": "${data.generated_date}"}'::JSONB
)${index < data.sites.length - 1 ? ',' : ';'}`
  }).join('\n')

  sql += values

  sql += `

-- Clean up helper functions
DROP FUNCTION IF EXISTS parse_site_date(TEXT);
DROP FUNCTION IF EXISTS extract_primary_company(TEXT);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_commodity_locations_start_date ON public.commodity_locations(start_date);
CREATE INDEX IF NOT EXISTS idx_commodity_locations_production_yearly ON public.commodity_locations(production_yearly);
CREATE INDEX IF NOT EXISTS idx_commodity_locations_operator ON public.commodity_locations(operator);
CREATE INDEX IF NOT EXISTS idx_commodity_locations_status ON public.commodity_locations(operational_status);

-- Update companies RLS policy for open access
DROP POLICY IF EXISTS "Authenticated users can read companies" ON public.companies;
CREATE POLICY "Anyone can read companies" ON public.companies
  FOR SELECT USING (true);

-- Verification query
SELECT COUNT(*) as total_algeria_sites, 
       COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as sites_with_coordinates,
       COUNT(CASE WHEN operational_status = 'active' THEN 1 END) as active_sites,
       COUNT(CASE WHEN operational_status != 'active' THEN 1 END) as inactive_sites
FROM public.commodity_locations 
WHERE country = 'Algeria';
`

  return sql
}

// Read and process JSON file
const jsonPath = path.join(__dirname, '../../Countries data/Algeria_all_sites.json')
const jsonData = fs.readFileSync(jsonPath, 'utf-8')
const data: AlgeriaData = JSON.parse(jsonData)

// Generate SQL
const sql = generateSQL(data)

// Write SQL file
const outputPath = path.join(__dirname, '../IMPORT_ALGERIA_OIL_FIELDS_COMPLETE.sql')
fs.writeFileSync(outputPath, sql, 'utf-8')

console.log(`✅ Generated SQL file with ${data.total_sites} Algeria sites`)
console.log(`📁 Output: ${outputPath}`)
console.log(`\nNext steps:`)
console.log(`1. Run the SQL file in your Supabase SQL Editor`)
console.log(`2. Refresh your platform to see all Algeria oil & gas fields on the globe`)
