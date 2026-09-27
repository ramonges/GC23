"""Render the Vulcan Trade hero Earth loop (MP4 + WebM + WebP poster).

Usage:
    python3 scripts/render-hero-loop.py --textures /tmp/vulcan --out public/hero

Textures (from three-globe's example assets):
    earth-blue-marble.jpg, earth-night.jpg, night-sky.png

The globe geometry is read from lib/vulcan/heroGlobe.json so the live point
overlay in the browser projects to exactly the same pixels as the video.
"""

import argparse
import json
import os
import shutil
import subprocess
import tempfile

import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def load_rgb(path, size=None):
    im = Image.open(path).convert("RGB")
    if size:
        im = im.resize(size, Image.LANCZOS)
    return np.asarray(im, dtype=np.float32) / 255.0


def smoothstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def sample_bilinear(tex, u, v):
    h, w, _ = tex.shape
    x = (u % 1.0) * w - 0.5
    y = np.clip(v, 0.0, 1.0) * (h - 1)
    x0 = np.floor(x).astype(np.int64)
    y0 = np.floor(y).astype(np.int64)
    fx = (x - x0)[..., None]
    fy = (y - y0)[..., None]
    x0 %= w
    x1 = (x0 + 1) % w
    y1 = np.clip(y0 + 1, 0, h - 1)
    y0 = np.clip(y0, 0, h - 1)
    top = tex[y0, x0] * (1 - fx) + tex[y0, x1] * fx
    bot = tex[y1, x0] * (1 - fx) + tex[y1, x1] * fx
    return top * (1 - fy) + bot * fy


class Scene:
    def __init__(self, cfg, textures):
        self.cfg = cfg
        w, h = cfg["width"], cfg["height"]
        self.w, self.h = w, h
        self.day = load_rgb(os.path.join(textures, "earth-blue-marble.jpg"))
        self.night = load_rgb(os.path.join(textures, "earth-night.jpg"))
        self.background = self._background(os.path.join(textures, "night-sky.png"))

        ys, xs = np.mgrid[0:h, 0:w].astype(np.float32)
        r = cfg["radius"]
        sx = (xs + 0.5 - cfg["cx"]) / r
        sy = -(ys + 0.5 - cfg["cy"]) / r
        self.dist = np.sqrt(sx * sx + sy * sy)
        self.sx, self.sy = sx, sy

        roll = np.radians(cfg["rollDeg"])
        # Undo the screen roll to get globe-frame coordinates.
        gx = sx * np.cos(-roll) - sy * np.sin(-roll)
        gy = sx * np.sin(-roll) + sy * np.cos(-roll)
        inside = self.dist <= 1.0
        gz = np.sqrt(np.clip(1.0 - gx * gx - gy * gy, 0.0, 1.0))
        self.inside = inside
        self.nz = gz

        lat0 = np.radians(cfg["viewLatDeg"])
        self.lat = np.arcsin(np.clip(gy * np.cos(lat0) + gz * np.sin(lat0), -1, 1))
        self.dlon = np.arctan2(gx, gz * np.cos(lat0) - gy * np.sin(lat0))

        # Sun from the upper left, slightly behind the camera plane.
        light = np.array([-0.62, 0.42, 0.66], dtype=np.float32)
        light /= np.linalg.norm(light)
        self.lambert = sx * light[0] + sy * light[1] + gz * light[2]
        self.light2d = light[:2] / np.linalg.norm(light[:2])

        edge = np.clip(1.0 - self.dist, 0.0, 1.0)
        self.aa = np.clip(edge * r, 0.0, 1.0)  # 1px anti-aliased limb

        vx = (xs / w - 0.62) * 1.25
        vy = ys / h - 0.52
        self.vignette = np.clip(1.0 - 0.9 * (vx * vx + vy * vy), 0.25, 1.0)[..., None]

        self.rng = np.random.default_rng(7)

    def _background(self, path):
        sky = Image.open(path).convert("RGB")
        scale = max(self.w / sky.width, self.h / sky.height) * 1.1
        sky = sky.resize((int(sky.width * scale), int(sky.height * scale)), Image.LANCZOS)
        left = (sky.width - self.w) // 2
        top = (sky.height - self.h) // 2
        sky = sky.crop((left, top, left + self.w, top + self.h))
        arr = np.asarray(sky, dtype=np.float32) / 255.0
        luma = arr.mean(axis=2, keepdims=True)
        arr = luma * 0.55 + arr * 0.45
        arr = np.clip(arr * 1.6, 0, 1) ** 1.05 * 0.85
        charcoal = np.array([0.038, 0.037, 0.043], dtype=np.float32)
        return np.maximum(arr, charcoal)

    def frame(self, t):
        cfg = self.cfg
        lonc = np.radians(cfg["startLonDeg"]) - 2 * np.pi * (t / cfg["periodSec"])
        lon = self.dlon + lonc
        u = (lon / (2 * np.pi) + 0.5) % 1.0
        v = 0.5 - self.lat / np.pi

        inside = self.inside
        day = sample_bilinear(self.day, u, v)
        night = sample_bilinear(self.night, u, v)

        lam = self.lambert
        daylight = smoothstep(-0.08, 0.35, lam)[..., None]
        diffuse = (0.08 + 1.05 * np.clip(lam, 0, 1))[..., None]
        day_grade = day ** 1.22
        luma = day_grade.mean(axis=2, keepdims=True)
        day_grade = (luma * 0.32 + day_grade * 0.68) * np.array([1.08, 0.98, 0.86], dtype=np.float32)
        lit = day_grade * diffuse
        city = (night ** 1.6) * np.array([1.35, 0.72, 0.32], dtype=np.float32) * 1.4
        surface = lit * daylight + city * (1 - daylight) + 0.012

        fresnel = ((1.0 - self.nz) ** 3)[..., None]
        rim_light = np.clip(0.25 + 0.75 * lam, 0, 1)[..., None]
        atmosphere_color = np.array([0.42, 0.56, 0.82], dtype=np.float32)
        surface = surface + fresnel * atmosphere_color * 0.45 * rim_light

        img = self.background.copy()
        mask = (self.aa * inside)[..., None]
        img = img * (1 - mask) + surface * mask

        # Outer atmospheric glow, brighter on the sunlit limb.
        d = self.dist
        outside = np.clip(d - 1.0, 0.0, None)
        facing = np.clip(
            (self.sx * self.light2d[0] + self.sy * self.light2d[1]) / np.maximum(d, 1e-6), -1, 1
        )
        glow_strength = np.exp(-outside * 22.0) * 0.5 + np.exp(-outside * 5.0) * 0.08
        glow_strength *= 0.35 + 0.65 * np.clip(facing * 0.5 + 0.5, 0, 1)
        glow_strength *= (d > 1.0)
        glow_color = np.array([0.55, 0.66, 0.92], dtype=np.float32)
        img = img + glow_strength[..., None] * glow_color

        img = img * self.vignette
        img = np.clip(img, 0, 1) ** (1 / 1.05)

        grain = self.rng.normal(0.0, 0.012, size=(self.h, self.w, 1)).astype(np.float32)
        img = np.clip(img + grain, 0, 1)
        return (img * 255.0 + 0.5).astype(np.uint8)


def run(cmd):
    print("+", " ".join(cmd))
    subprocess.run(cmd, check=True)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--textures", default="/tmp/vulcan")
    parser.add_argument("--out", default=os.path.join(ROOT, "public", "hero"))
    parser.add_argument("--seconds", type=float, default=None)
    args = parser.parse_args()

    with open(os.path.join(ROOT, "lib", "vulcan", "heroGlobe.json")) as f:
        cfg = json.load(f)

    os.makedirs(args.out, exist_ok=True)
    scene = Scene(cfg, args.textures)
    fps = cfg["fps"]
    seconds = args.seconds or cfg["periodSec"]
    frames = int(round(seconds * fps))

    tmp = tempfile.mkdtemp(prefix="vulcan-hero-")
    try:
        for i in range(frames):
            Image.fromarray(scene.frame(i / fps)).save(os.path.join(tmp, f"f{i:04d}.png"), compress_level=1)
            if i % 48 == 0:
                print(f"frame {i}/{frames}")

        poster = Image.open(os.path.join(tmp, "f0000.png"))
        poster.save(os.path.join(args.out, "earth-poster.webp"), "WEBP", quality=82, method=6)
        poster.resize((960, 540), Image.LANCZOS).save(
            os.path.join(args.out, "earth-poster-mobile.webp"), "WEBP", quality=80, method=6
        )

        pattern = os.path.join(tmp, "f%04d.png")
        run([
            "ffmpeg", "-y", "-loglevel", "error", "-framerate", str(fps), "-i", pattern,
            "-c:v", "libx264", "-preset", "slow", "-crf", "27", "-pix_fmt", "yuv420p",
            "-movflags", "+faststart", "-an", os.path.join(args.out, "earth-loop.mp4"),
        ])
        run([
            "ffmpeg", "-y", "-loglevel", "error", "-framerate", str(fps), "-i", pattern,
            "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "40", "-row-mt", "1", "-deadline", "good",
            "-cpu-used", "2", "-pix_fmt", "yuv420p", "-an", os.path.join(args.out, "earth-loop.webm"),
        ])
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    main()
