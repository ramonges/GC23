#!/usr/bin/env python3
"""Add coordinates to China oil field sites"""
import json
import os

# China major oil/gas basins and their approximate centers:
# 1. Daqing (Songliao Basin, Heilongjiang): 46.6°N, 125°E
# 2. Shengli (Bohai Bay Basin, Shandong): 37.5°N, 118.7°E
# 3. Changqing (Ordos Basin, Shaanxi/Gansu): 37°N, 108°E
# 4. Tarim Basin (Xinjiang): 41°N, 83°E
# 5. Junggar Basin (Xinjiang): 45°N, 86°E
# 6. Bohai Offshore: 39°N, 119°E

COORDINATES_MAP = {
    # Daqing area
    "Daqing Oil Field (大庆油田)": (46.59, 125.02),
    "Lamadian Oilfield (喇嘛甸油田)": (46.731, 124.867),
    "Saertu Oilfield (萨尔图油田)": (46.6, 125.0),
    "Xingshugang Oilfield (杏树岗油田)": (46.55, 125.05),
    "Chaoyanggou Oilfield (朝阳沟油田)": (46.5, 125.1),
    "Gulong Shale Oil Block / Gulong Shale Oil (古龙页岩油区块)": (46.4, 124.8),
    "Songji-3 / Daqing Inaugural Oil Well (松基三井)": (46.0, 124.9),
    
    # Shengli area
    "Shengli Oil Field (overall complex)": (37.45, 118.67),
    "Chengdao Offshore Oilfield (Shengli offshore; Chengdao No.1 Central Platform hub)": (38.15, 118.95),
    "Chengbei Offshore Heavy Oil Area (e.g., Chengbei 208 well group within Shengli offshore)": (38.2, 119.0),
    "Jiyang Shale Oil National Demonstration Zone (Shengli; Jiyang shale oilfield)": (37.17, 117.83),
    "Zhuangxi Buried Hill Oil Field (Shengli main producing area; Genting contract)": (37.7, 118.9),
    "Zhanhua Dong Block (Shengli area onshore PSC exploration block)": (37.7, 118.2),
    "Shengli Oilfield Tuo 11 Well Area (Shengtuo/Shengli village historical high-rate well area)": (37.45, 118.67),
    
    # Changqing/Ordos area
    "Sulige Gas Complex (苏里格)": (38.564, 108.306),
    "Changqing Oil Field / Changqing Oilfield (长庆油田)": (37.5, 108.5),
    "Qingcheng Shale Oil Field (庆城页岩油 / Qingcheng Oil Field)": (36.5752, 107.4443),
    "Heshui Shale Oil Field (合水页岩油)": (36.1175, 108.6686),
    "Xifeng Oil Field (西峰油田)": (36.2404, 107.6109),
    "Huaqing Oil Field (华庆油田)": (36.3, 107.5),
    "环江 Oil Field (Huanjiang Oil Field)": (36.957, 107.0164),
    "Zhenbei Oil Field (镇北油田)": (37.0, 107.8),
    "Jing'an Oil Field (靖安油田)": (37.5, 108.8),
    "Jiyuan Oil Field (姬塬油田)": (37.2916, 107.3466),
    "Hujianshan Oil Field (胡尖山油田)": (37.3056, 108.2201),
    "Xin'anbian Tight Oil Field (新安边致密油)": (37.4, 108.0),
    "Changbei Tight I Gas Phase (长北致密气(一期))": (38.0, 109.5),
    "Changbei Tight II Gas Phase (长北致密气(二期))": (38.0, 109.5),
    "Yichuan Gas Field (宜川气田)": (36.0, 110.0),
    "Qingshimao Gas Field (青石峁气田)": (37.8, 107.2),
    
    # Bohai offshore
    "Suizhong 36-1 Oilfield": (40.0, 120.5),
    "Suizhong 36-1/Luda 5-2 Oilfield Secondary Adjustment and Development Project": (40.0, 120.5),
    "Suizhong 36-2 Oilfield (36-2 Block Development Project)": (40.05, 120.55),
    "Luda 6-2 Oilfield": (39.8, 121.0),
    "Luda 5-2 North Oilfield (Phase II Development Project)": (39.9, 120.8),
    "Penglai 19-3 Oilfield (Bohai Penglai / Block 11/05 PSC)": (38.5, 120.0),
    "Penglai 19-3 Oilfield Area 5/10 Development Project": (38.5, 120.0),
    "Penglai 19-3 Oilfield Area 4 Adjustment / Penglai 19-9 Oilfield Phase II Project": (38.5, 120.0),
    "Qinhuangdao 32-6 Oilfield (QHD 32-6)": (39.5, 119.5),
    "Caofeidian 6-4 Oilfield": (39.2, 118.8),
    "Caofeidian 6-4 Oilfield Comprehensive Adjustment Project": (39.2, 118.8),
    "Bozhong 19-2 Oilfield (Development Project)": (38.8, 119.2),
    "Bozhong 26-6 Oilfield (Development Project Phase I)": (38.6, 119.0),
    "Kenli 10-2 Oilfield (Development Project Phase I)": (38.0, 118.5),
    "Bozhong 19-6 Condensate Gas Field (Pilot Area Development Project)": (38.7, 119.3),
    "Bozhong 19-6 Condensate Gas Field (Phase I Development Project)": (38.7, 119.3),
    "Bozhong 19-6 Gas Field 13-2 Block 5 Well Site Development Project": (38.7, 119.3),
    "Qinhuangdao 29-6 Oilfield (Discovery; pre-development)": (39.3, 119.3),
    
    # Tarim Basin
    "Fuman Oilfield (富满油田)": (40.4, 83.6),
    "Hade Oilfield / Hadedun Oilfield (哈德敦油田; Hade-Fuman bloc component)": (40.7903, 83.678),
    "Tahe Oilfield (塔河油田)": (41.1, 82.6),
    "Tazhong Oil Field (塔中油田; Tazhong area development)": (40.5474, 82.5783),
    "Lunnan Oilfield (轮南油田)": (41.0, 84.0),
    "Sangtamu Oilfield (桑塔木油田)": (41.2, 83.5),
    "Donghetang Oilfield (东河塘油田)": (41.3, 83.8),
    "Jilak Oilfield (吉拉克油田)": (41.15, 83.6),
    "Jiefangqudong Oilfield (解放渠东油田)": (41.1, 83.7),
    "Kela-2 Gas Field (克拉2气田; condensate associated)": (41.8, 83.2),
    "Tarim Oilfield (Tarim Basin – overall oilfield operations area)": (41.2, 80.3),
    "Fuman (Fuman 1 billion-ton ultra-deep oil area / Fuman Oilfield, Tarim Basin)": (40.4, 83.6),
    "Tahe Oilfield (Tarim Basin, Akekule Arch)": (41.1, 82.6),
    
    # Junggar/Xinjiang
    "Karamay Oilfield (Karamay Oil Field)": (45.5959, 84.8892),
    "Mahu (Mahou) Tight Conglomerate Oilfield (Junggar Basin)": (46.6, 85.8),
    "Jimsar (Jimusaer) Shale Oil Demonstration Zone (Junggar Basin)": (44.0, 89.2),
    "Tuha (Turpan–Hami) Oilfield (Tuha Oilfield)": (42.9, 89.2),
}

PARTIAL_MATCHES = {
    "daqing": (46.59, 125.02),
    "saertu": (46.6, 125.0),
    "xingshugang": (46.55, 125.05),
    "lamadian": (46.731, 124.867),
    "chaoyanggou": (46.5, 125.1),
    "gulong": (46.4, 124.8),
    "shengli": (37.45, 118.67),
    "chengdao": (38.15, 118.95),
    "chengbei": (38.2, 119.0),
    "jiyang": (37.17, 117.83),
    "zhuangxi": (37.7, 118.9),
    "zhanhua": (37.7, 118.2),
    "sulige": (38.564, 108.306),
    "changqing": (37.5, 108.5),
    "qingcheng": (36.5752, 107.4443),
    "heshui": (36.1175, 108.6686),
    "xifeng": (36.2404, 107.6109),
    "huaqing": (36.3, 107.5),
    "huanjiang": (36.957, 107.0164),
    "zhenbei": (37.0, 107.8),
    "jing'an": (37.5, 108.8),
    "jingan": (37.5, 108.8),
    "jiyuan": (37.2916, 107.3466),
    "hujianshan": (37.3056, 108.2201),
    "xin'anbian": (37.4, 108.0),
    "changbei": (38.0, 109.5),
    "yichuan": (36.0, 110.0),
    "qingshimao": (37.8, 107.2),
    "suizhong": (40.0, 120.5),
    "luda": (39.9, 120.8),
    "penglai": (38.5, 120.0),
    "qinhuangdao": (39.5, 119.5),
    "caofeidian": (39.2, 118.8),
    "bozhong": (38.7, 119.3),
    "kenli": (38.0, 118.5),
    "fuman": (40.4, 83.6),
    "hade": (40.7903, 83.678),
    "tahe": (41.1, 82.6),
    "tazhong": (40.5474, 82.5783),
    "lunnan": (41.0, 84.0),
    "sangtamu": (41.2, 83.5),
    "donghetang": (41.3, 83.8),
    "jilak": (41.15, 83.6),
    "jiefang": (41.1, 83.7),
    "kela": (41.8, 83.2),
    "tarim": (41.2, 80.3),
    "karamay": (45.5959, 84.8892),
    "mahu": (46.6, 85.8),
    "jimsar": (44.0, 89.2),
    "tuha": (42.9, 89.2),
    "turpan": (42.9, 89.2),
    "bohai": (39.0, 119.0),
    "ordos": (38.0, 108.0),
}

script_dir = os.path.dirname(os.path.abspath(__file__))
input_path = '/Users/b23/Desktop/GC23/Countries data/China_all_sites.json'
output_path = os.path.join(script_dir, '../China_all_sites_with_coordinates.json')

with open(input_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

updated = 0
already_has = 0
for site in data['sites']:
    name = site['site_name']
    name_lower = name.lower()
    
    if site.get('latitude') and site.get('longitude'):
        already_has += 1
        continue
    
    if name in COORDINATES_MAP:
        lat, lng = COORDINATES_MAP[name]
        site['latitude'] = lat
        site['longitude'] = lng
        updated += 1
        print(f"✅ Exact: {name[:50]}... -> ({lat}, {lng})")
        continue
    
    matched = False
    for pattern, coords in PARTIAL_MATCHES.items():
        if pattern in name_lower:
            lat, lng = coords
            site['latitude'] = lat
            site['longitude'] = lng
            updated += 1
            print(f"✅ Partial [{pattern}]: {name[:50]}... -> ({lat}, {lng})")
            matched = True
            break
    
    if not matched:
        province = site.get('state_province', '').lower()
        if 'heilongjiang' in province or 'daqing' in province:
            site['latitude'] = 46.5
            site['longitude'] = 125.0
        elif 'shandong' in province or 'dongying' in province:
            site['latitude'] = 37.5
            site['longitude'] = 118.5
        elif 'bohai' in province:
            site['latitude'] = 39.0
            site['longitude'] = 119.0
        elif 'xinjiang' in province:
            if 'tarim' in province or 'aksu' in province:
                site['latitude'] = 41.0
                site['longitude'] = 83.0
            else:
                site['latitude'] = 45.0
                site['longitude'] = 86.0
        elif 'shaanxi' in province or 'gansu' in province or 'ordos' in province or 'ningxia' in province:
            site['latitude'] = 37.5
            site['longitude'] = 108.0
        else:
            site['latitude'] = 39.0
            site['longitude'] = 116.0
        updated += 1
        print(f"⚠️  Default: {name[:50]}... -> ({site['latitude']}, {site['longitude']})")

with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"\n✅ Updated {updated} China sites (already had coords: {already_has})")
print(f"📁 Saved to: {output_path}")
