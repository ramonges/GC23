"""Bake the stylized textures used by the hero scene.

Outputs (public/hero/):
  earth-color.webp    4096x2048 equirectangular globe, alpha = land mask
  patch-guinea.webp   high-resolution regional terrain around Boké / Kamsar
  patch-gulf.webp     high-resolution regional terrain for the US Gulf industrial sites

Inputs (download once):
  curl -sSfLo /tmp/vulcan/earth-blue-marble.jpg https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg
  curl -sSfLo /tmp/vulcan/earth-topology.png https://unpkg.com/three-globe/example/img/earth-topology.png
  curl -sSfLo /tmp/vulcan/ne_10m_land.geojson https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_land.geojson
  curl -sSfLo /tmp/vulcan/ne_10m_rivers_lake_centerlines.geojson https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_rivers_lake_centerlines.geojson

Usage:
  python3 scripts/bake-hero-textures.py [/tmp/vulcan]

Patch bounds must match PATCHES in components/vulcan/hero/scene/sites.ts.
"""

import json
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

SRC = sys.argv[1] if len(sys.argv) > 1 else "/tmp/vulcan"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "hero")

PATCHES = {
    "guinea": {"lat": (8.5, 13.5), "lng": (-16.5, -11.5), "size": 4096, "laterite": (11.1, -13.8)},
    "gulf": {"lat": (28.0, 33.0), "lng": (-93.0, -87.0), "size": 3072, "laterite": None},
}


def hexrgb(h):
    h = h.lstrip("#")
    return np.array([int(h[i : i + 2], 16) / 255 for i in (0, 2, 4)], dtype=np.float32)


VEG = hexrgb("#2f3a29")
VEG2 = hexrgb("#384531")
SOIL = hexrgb("#5a4a38")
DESERT = hexrgb("#94806a")
ICE = hexrgb("#c6c8c1")
LATERITE = hexrgb("#8f4128")
DEEP = hexrgb("#0a1012")
SHELF = hexrgb("#22323a")
RIVER = hexrgb("#1e2c31")


def smoothstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def load_land():
    with open(os.path.join(SRC, "ne_10m_land.geojson")) as f:
        return json.load(f)["features"]


def rings(features):
    for feat in features:
        g = feat["geometry"]
        polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
        for poly in polys:
            yield poly[0], poly[1:]


def clip_ring(ring, x0, y0, x1, y1):
    """Sutherland-Hodgman clip to a rectangle; PIL's scanline fill streaks on rings far outside the canvas."""

    def clip(pts, inside, cross):
        out = []
        for i, cur in enumerate(pts):
            prev = pts[i - 1]
            if inside(cur):
                if not inside(prev):
                    out.append(cross(prev, cur))
                out.append(cur)
            elif inside(prev):
                out.append(cross(prev, cur))
        return out

    def at_x(x):
        return lambda a, b: (x, a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]))

    def at_y(y):
        return lambda a, b: (a[0] + (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]), y)

    pts = [tuple(p[:2]) for p in ring]
    for inside, cross in (
        (lambda p: p[0] >= x0, at_x(x0)),
        (lambda p: p[0] <= x1, at_x(x1)),
        (lambda p: p[1] >= y0, at_y(y0)),
        (lambda p: p[1] <= y1, at_y(y1)),
    ):
        if not pts:
            break
        pts = clip(pts, inside, cross)
    return pts


def raster_mask(features, width, height, lat_range, lng_range, ss=2):
    W, H = width * ss, height * ss
    img = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(img)
    (lat0, lat1), (lng0, lng1) = lat_range, lng_range

    def px(lng, lat):
        return ((lng - lng0) / (lng1 - lng0) * W, (lat1 - lat) / (lat1 - lat0) * H)

    for outer, holes in rings(features):
        xs = [p[0] for p in outer]
        ys = [p[1] for p in outer]
        if max(xs) < lng0 or min(xs) > lng1 or max(ys) < lat0 or min(ys) > lat1:
            continue
        pad = 0.5
        for ring, fill in [(outer, 255)] + [(h, 0) for h in holes]:
            clipped = clip_ring(ring, lng0 - pad, lat0 - pad, lng1 + pad, lat1 + pad)
            if len(clipped) >= 3:
                d.polygon([px(*p) for p in clipped], fill=fill)
    return np.asarray(img.resize((width, height), Image.LANCZOS), dtype=np.float32) / 255


def fbm(width, height, octaves, seed, base=8):
    rng = np.random.default_rng(seed)
    acc = np.zeros((height, width), np.float32)
    amp, total = 1.0, 0.0
    for o in range(octaves):
        n = base * (2**o)
        grid = rng.random((max(2, n * height // width), n)).astype(np.float32)
        layer = np.asarray(Image.fromarray((grid * 255).astype(np.uint8)).resize((width, height), Image.BICUBIC), np.float32) / 255
        acc += layer * amp
        total += amp
        amp *= 0.5
    return acc / total


def stylize(bm, mask, shelf_blur, hill):
    r, g, b = bm[..., 0], bm[..., 1], bm[..., 2]
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    arid = np.clip(r - b, 0, 1)
    t_soil = smoothstep(0.1, 0.24, lum)[..., None]
    t_desert = (smoothstep(0.24, 0.42, lum) * smoothstep(0.03, 0.12, arid))[..., None]
    land = VEG * (1 - t_soil) + SOIL * t_soil
    land = land * (1 - t_desert) + DESERT * t_desert
    land = land * 0.82 + bm * 0.18
    ice = (smoothstep(0.62, 0.78, lum) * smoothstep(-0.02, 0.03, b - r))[..., None]
    land = land * (1 - ice) + ICE * ice
    land = land * hill[..., None]

    shallow = np.clip(shelf_blur * 1.2, 0, 1)[..., None]
    ocean = DEEP * (1 - shallow * 0.6) + SHELF * (shallow * 0.6)

    m = mask[..., None]
    return land * m + ocean * (1 - m)


def hillshade(topo):
    gy, gx = np.gradient(topo)
    light = np.array([-0.6, -0.55, 0.58])
    nx, ny, nz = -gx * 18, -gy * 18, np.ones_like(topo)
    n = np.sqrt(nx * nx + ny * ny + nz * nz)
    shade = (nx * light[0] + ny * light[1] + nz * light[2]) / n
    return 0.9 + (shade - light[2]) * 0.5


def coast_line(mask):
    edge = np.asarray(Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.FIND_EDGES), np.float32) / 255
    return np.clip(edge * 1.5, 0, 1)


def save(arr, alpha, name, quality):
    rgb = (np.clip(arr, 0, 1) * 255).astype(np.uint8)
    a = (np.clip(alpha, 0, 1) * 255).astype(np.uint8)
    img = Image.fromarray(np.dstack([rgb, a]), "RGBA")
    path = os.path.join(OUT, name)
    img.save(path, "WEBP", quality=quality, method=6, alpha_quality=80, exact=True)
    print(path, img.size, os.path.getsize(path))


def bake_earth(land):
    W, H = 4096, 2048
    print("earth mask")
    mask = raster_mask(land, W, H, (-90, 90), (-180, 180), ss=2)
    bm = np.asarray(Image.open(os.path.join(SRC, "earth-blue-marble.jpg")).convert("RGB").resize((W, H), Image.LANCZOS), np.float32) / 255
    topo = np.asarray(Image.open(os.path.join(SRC, "earth-topology.png")).convert("L").resize((W, H), Image.BICUBIC), np.float32) / 255
    shelf = np.asarray(Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(10)), np.float32) / 255
    color = stylize(bm, mask, shelf * (1 - mask), hillshade(topo))
    color += coast_line(mask)[..., None] * 0.05
    save(color, mask, "earth-color.webp", 84)


def draw_rivers(img_size, lat_range, lng_range, width_px):
    W, H = img_size
    with open(os.path.join(SRC, "ne_10m_rivers_lake_centerlines.geojson")) as f:
        feats = json.load(f)["features"]
    layer = Image.new("L", (W * 2, H * 2), 0)
    d = ImageDraw.Draw(layer)
    (lat0, lat1), (lng0, lng1) = lat_range, lng_range
    for feat in feats:
        g = feat["geometry"]
        if not g:
            continue
        lines = g["coordinates"] if g["type"] == "MultiLineString" else [g["coordinates"]]
        for line in lines:
            pts = [((p[0] - lng0) / (lng1 - lng0) * W * 2, (lat1 - p[1]) / (lat1 - lat0) * H * 2) for p in line]
            if any(0 <= x <= W * 2 and 0 <= y <= H * 2 for x, y in pts):
                d.line(pts, fill=255, width=width_px * 2)
    return np.asarray(layer.resize((W, H), Image.LANCZOS), np.float32) / 255


def bake_patch(land, name, spec):
    S = spec["size"]
    (lat0, lat1), (lng0, lng1) = spec["lat"], spec["lng"]
    print("patch", name)
    mask = raster_mask(land, S, S, spec["lat"], spec["lng"], ss=2)
    full = Image.open(os.path.join(SRC, "earth-blue-marble.jpg")).convert("RGB")
    fw, fh = full.size
    box = ((lng0 + 180) / 360 * fw, (90 - lat1) / 180 * fh, (lng1 + 180) / 360 * fw, (90 - lat0) / 180 * fh)
    bm = np.asarray(full.crop(tuple(int(round(v)) for v in box)).resize((S, S), Image.BICUBIC), np.float32) / 255
    bm = np.asarray(Image.fromarray((bm * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(S / 400)), np.float32) / 255

    topo_full = Image.open(os.path.join(SRC, "earth-topology.png")).convert("L")
    tw, th = topo_full.size
    tbox = ((lng0 + 180) / 360 * tw, (90 - lat1) / 180 * th, (lng1 + 180) / 360 * tw, (90 - lat0) / 180 * th)
    topo = np.asarray(topo_full.crop(tuple(int(round(v)) for v in tbox)).resize((S, S), Image.BICUBIC), np.float32) / 255
    detail = fbm(S, S, 6, seed=hash(name) % 1000, base=6)
    hill = hillshade(topo * 0.25 + detail * 0.012)

    shelf = np.asarray(Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(S / 60)), np.float32) / 255
    color = stylize(bm, mask, shelf * (1 - mask), hill)

    veg_var = (fbm(S, S, 5, seed=7, base=10) - 0.5)[..., None]
    color = color * (1 + veg_var * 0.35 * mask[..., None])
    fields = fbm(S, S, 3, seed=11, base=40)
    color = color * (1 + (smoothstep(0.55, 0.62, fields) - 0.5)[..., None] * 0.06 * mask[..., None])

    if spec["laterite"]:
        la, ln = spec["laterite"]
        yy, xx = np.mgrid[0:S, 0:S].astype(np.float32)
        lat = lat1 - yy / S * (lat1 - lat0)
        lng = lng0 + xx / S * (lng1 - lng0)
        dist = np.sqrt((lat - la) ** 2 + ((lng - ln) * np.cos(np.radians(la))) ** 2)
        plateaus = smoothstep(0.56, 0.64, fbm(S, S, 5, seed=3, base=36)) * (1 - smoothstep(0.6, 2.4, dist))
        t = (plateaus * 0.42 * mask)[..., None]
        color = color * (1 - t) + LATERITE * (0.85 + veg_var * 0.3) * t

    rivers = draw_rivers((S, S), spec["lat"], spec["lng"], max(1, S // 1500)) * mask
    color = color * (1 - rivers[..., None] * 0.85) + RIVER * rivers[..., None] * 0.85
    color += coast_line(mask)[..., None] * 0.06
    save(color, np.clip(mask + rivers, 0, 1) * mask, f"patch-{name}.webp", 82)


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    land = load_land()
    bake_earth(land)
    for name, spec in PATCHES.items():
        bake_patch(land, name, spec)
