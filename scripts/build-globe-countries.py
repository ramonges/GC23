"""Slim Natural Earth 110m countries into public/globe/countries.json for the Origins globe.

Usage:
    curl -sSfL -o /tmp/countries.geojson \
      https://raw.githubusercontent.com/vasturiano/globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson
    python3 scripts/build-globe-countries.py /tmp/countries.geojson
"""

import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def round_ring(ring):
    return [[round(x, 2), round(y, 2)] for x, y in ring]


def is_valid(poly):
    # h3 polygonToCells throws on rings that collapse to fewer than 4 distinct points.
    return len({tuple(p) for p in poly[0]}) >= 4


def main(src_path):
    src = json.load(open(src_path))
    features = []
    for f in src["features"]:
        name = f["properties"].get("ADMIN") or f["properties"].get("NAME")
        if name == "Antarctica":
            continue
        g = f["geometry"]
        polys = [g["coordinates"]] if g["type"] == "Polygon" else g["coordinates"]
        kept = [p for p in ([round_ring(r) for r in poly] for poly in polys) if is_valid(p)]
        if not kept:
            continue
        geom = {"type": "Polygon", "coordinates": kept[0]} if len(kept) == 1 else {"type": "MultiPolygon", "coordinates": kept}
        features.append({"type": "Feature", "properties": {"name": name}, "geometry": geom})

    out = os.path.join(ROOT, "public", "globe", "countries.json")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, "w") as fh:
        json.dump({"type": "FeatureCollection", "features": features}, fh, separators=(",", ":"))
    print(f"{len(features)} countries -> {out} ({os.path.getsize(out)} bytes)")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "/tmp/countries.geojson")
