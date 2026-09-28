"""Downscale NASA Blue Marble to the color map sampled for the hero's low-poly Earth facets.

Usage:
    curl -sSfL -o /tmp/earth-blue-marble.jpg https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg
    python3 scripts/build-earth-lowres.py /tmp/earth-blue-marble.jpg
"""

import os
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

src = sys.argv[1] if len(sys.argv) > 1 else "/tmp/earth-blue-marble.jpg"
out = os.path.join(ROOT, "public", "hero", "earth-lowres.webp")
Image.open(src).convert("RGB").resize((1024, 512), Image.LANCZOS).save(out, "WEBP", quality=82, method=6)
print(out, os.path.getsize(out))
