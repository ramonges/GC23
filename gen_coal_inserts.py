#!/usr/bin/env python3
"""Generate coal_mines INSERT SQL from JSON. Run: python3 gen_coal_inserts.py < input.json > output.sql"""

import json
import sys

def esc(s):
    if s is None: return 'NULL'
    return "'" + str(s).replace("'", "''") + "'"

def to_jsonb(arr):
    if not arr: return "'[]'::jsonb"
    s = json.dumps(arr)
    return "'" + s.replace("'", "''") + "'::jsonb"

def num(v):
    if v is None: return 'NULL'
    if isinstance(v, str):
        v = v.replace(',','').strip()
        if not v or v in ('Ongoing','Active','Late 1960s','2000s','Post-1916','Post-2014'): return 'NULL'
        try: return str(int(float(v))) if '.' not in v else str(float(v))
        except: return 'NULL'
    try: return str(int(v)) if isinstance(v, (int, float)) and v == int(v) else str(float(v))
    except: return 'NULL'

data = json.load(sys.stdin)
cols = 'mine_name, operator, license_number, contact_email, contact_phone, country, region, address, latitude, longitude, nearest_port, nearest_railway, founded_year, years_in_operation, original_owner, ownership_changes, major_milestones, notable_incidents, estimated_mine_life_remaining_years, coal_type, grade, calorific_value_kcal_kg, moisture_percent, ash_percent, sulfur_percent, size_mm, annual_capacity_tonnes, available_stock_tonnes, mining_method, price_per_tonne_usd, price_basis, minimum_order_tonnes, payment_terms, contract_types, loading_port, transport_modes, lead_time_days, export_license, certifications'

on_conflict = "ON CONFLICT (mine_name, country) DO UPDATE SET operator = EXCLUDED.operator, license_number = EXCLUDED.license_number, contact_email = EXCLUDED.contact_email, contact_phone = EXCLUDED.contact_phone, region = EXCLUDED.region, address = EXCLUDED.address, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, nearest_port = EXCLUDED.nearest_port, nearest_railway = EXCLUDED.nearest_railway, founded_year = EXCLUDED.founded_year, years_in_operation = EXCLUDED.years_in_operation, original_owner = EXCLUDED.original_owner, ownership_changes = EXCLUDED.ownership_changes, major_milestones = EXCLUDED.major_milestones, notable_incidents = EXCLUDED.notable_incidents, estimated_mine_life_remaining_years = EXCLUDED.estimated_mine_life_remaining_years, coal_type = EXCLUDED.coal_type, grade = EXCLUDED.grade, calorific_value_kcal_kg = EXCLUDED.calorific_value_kcal_kg, moisture_percent = EXCLUDED.moisture_percent, ash_percent = EXCLUDED.ash_percent, sulfur_percent = EXCLUDED.sulfur_percent, size_mm = EXCLUDED.size_mm, annual_capacity_tonnes = EXCLUDED.annual_capacity_tonnes, available_stock_tonnes = EXCLUDED.available_stock_tonnes, mining_method = EXCLUDED.mining_method, price_per_tonne_usd = EXCLUDED.price_per_tonne_usd, price_basis = EXCLUDED.price_basis, minimum_order_tonnes = EXCLUDED.minimum_order_tonnes, payment_terms = EXCLUDED.payment_terms, contract_types = EXCLUDED.contract_types, loading_port = EXCLUDED.loading_port, transport_modes = EXCLUDED.transport_modes, lead_time_days = EXCLUDED.lead_time_days, export_license = EXCLUDED.export_license, certifications = EXCLUDED.certifications, updated_at = NOW();"

for m in data:
    ident = m.get('identification', {})
    loc = m.get('location', {})
    hist = m.get('history', {})
    op = m.get('operational_details', {})
    contact = ident.get('contact') or {}
    if not isinstance(contact, dict): contact = {}
    coords = loc.get('coordinates') or {}
    if not isinstance(coords, dict): coords = {}

    lat = coords.get('latitude')
    lon = coords.get('longitude')

    ownership = hist.get('ownership_changes', [])
    milestones = hist.get('major_milestones', [])
    if milestones and isinstance(milestones[0], str):
        milestones = [{'year': None, 'event': e} for e in milestones]
    incidents = hist.get('notable_incidents', [])
    if incidents and isinstance(incidents[0], str):
        incidents = [{'year': None, 'event': e} for e in incidents]

    transport = op.get('transport_method') or loc.get('nearest_railway') or 'Road'
    if isinstance(transport, str): transport = [transport]

    annual = op.get('annual_production_tonnes') or op.get('annual_capacity_tonnes')
    if isinstance(annual, str) and annual.isdigit(): annual = int(annual)

    yop = hist.get('years_in_operation')
    if isinstance(yop, (int, float)): yop = int(yop)
    elif isinstance(yop, str) and yop.isdigit(): yop = int(yop)
    else: yop = None

    vals = [
        esc(ident.get('mine_name')),
        esc(ident.get('operator')),
        esc(ident.get('license_number')),
        esc(contact.get('email')),
        esc(contact.get('phone')),
        esc(loc.get('country')),
        esc(loc.get('region')),
        esc(loc.get('address')),
        num(lat),
        num(lon),
        esc(loc.get('nearest_port')),
        esc(loc.get('nearest_railway')),
        num(hist.get('founded_year')),
        num(yop) if yop is not None else 'NULL',
        esc(ident.get('parent_company')),
        to_jsonb(ownership),
        to_jsonb(milestones),
        to_jsonb(incidents),
        num(hist.get('estimated_mine_life_remaining_years')) if isinstance(hist.get('estimated_mine_life_remaining_years'), (int, float)) else 'NULL',
        esc(op.get('coal_rank') or op.get('coal_type')),
        esc(loc.get('coalfield') or op.get('coal_rank')),
        'NULL', 'NULL', 'NULL', 'NULL', 'NULL',
        num(annual),
        num(op.get('available_stock_tonnes')),
        esc(op.get('mining_method') or op.get('mine_type')),
        'NULL', 'NULL', 'NULL', 'NULL', 'NULL',
        esc(loc.get('nearest_port')),
        to_jsonb(transport) if isinstance(transport, list) else esc(transport),
        'NULL',
        'false',
        "'[]'::jsonb"
    ]

    print(f"INSERT INTO public.coal_mines ({cols})")
    print(f"VALUES ({', '.join(vals)})")
    print(on_conflict)
    print()
