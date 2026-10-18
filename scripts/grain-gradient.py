"""Grainy stipple gradient backgrounds for media tiles.

Soft blurred shapes become a density map; each pixel is inked with probability
equal to that density, so edges break up into speckle and cores go solid.

  python3 scripts/grain-gradient.py --color 2a9c64 --seed 7 --out public/textures/grain-green.png
  python3 scripts/grain-gradient.py --style rings --seed 4 --paper f2f3f1 --out public/textures/rings.png
  python3 scripts/grain-gradient.py --style rings --seed 9 --paper f2f3f1 --width 1765 --height 717 \
      --rings 8 --spread 0.42 --tiles 4 --out /tmp/row.png     # one texture across 4 tiles
"""
import argparse
import numpy as np
from PIL import Image


def blur(a, sigma):
    """Gaussian blur via FFT (wraps at edges; we pad before calling)."""
    h, w = a.shape
    fy = np.fft.fftfreq(h)[:, None]
    fx = np.fft.fftfreq(w)[None, :]
    k = np.exp(-2 * (np.pi * sigma) ** 2 * (fx ** 2 + fy ** 2))
    return np.real(np.fft.ifft2(np.fft.fft2(a) * k))


def density(w, h, rng):
    pad = int(0.25 * max(w, h))
    W, H = w + 2 * pad, h + 2 * pad
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    d = np.zeros((H, W), np.float32)
    # A few large rotated soft bars + blobs, placed loosely across the frame.
    for _ in range(rng.integers(5, 8)):
        cx, cy = rng.uniform(0, W), rng.uniform(0, H)
        sx = rng.uniform(0.07, 0.13) * W
        sy = sx * rng.uniform(0.35, 2.8)
        t = rng.uniform(0, np.pi)
        dx, dy = x - cx, y - cy
        u = dx * np.cos(t) + dy * np.sin(t)
        v = -dx * np.sin(t) + dy * np.cos(t)
        d += rng.uniform(0.7, 1.2) * np.exp(-(u ** 2 / (2 * sx ** 2) + v ** 2 / (2 * sy ** 2)))
    # Low-frequency wobble so shapes aren't perfect gaussians.
    d += 0.15 * blur(rng.standard_normal((H, W)).astype(np.float32), 0.04 * W) * 40
    d = d[pad:pad + h, pad:pad + w]
    d = np.clip(d / np.percentile(d, 99), 0, 1)
    return d


def rings(w, h, rng, n, spread=0.28):
    """Blurred loops: stroke width and strength vary around each ellipse."""
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    S = min(w, h)
    d = np.zeros((h, w), np.float32)
    for i in range(n):
        # Keep loops clustered around the middle so they overlap.
        cx = w / 2 + rng.uniform(-spread, spread) * w
        cy = h / 2 + rng.uniform(-0.3, 0.3) * h
        a = rng.uniform(0.28, 0.55) * S
        b = a * rng.uniform(0.45, 1.0)
        t = rng.uniform(0, np.pi)
        dx, dy = x - cx, y - cy
        u = dx * np.cos(t) + dy * np.sin(t)
        v = -dx * np.sin(t) + dy * np.cos(t)
        r = np.sqrt((u / a) ** 2 + (v / b) ** 2)
        ang = np.arctan2(v / b, u / a)
        dist = (r - 1) * np.sqrt(a * b)
        k, ph = rng.integers(1, 3), rng.uniform(0, 2 * np.pi)
        width = rng.uniform(0.055, 0.1) * S * (1 + 0.55 * np.sin(k * ang + ph))
        strength = 0.55 + 0.45 * np.sin(ang + rng.uniform(0, 2 * np.pi))
        d += strength * np.exp(-dist ** 2 / (2 * width ** 2))
    d = np.clip(d / np.percentile(d, 99.5), 0, 1.3)
    return d


def render_soft(w, h, ramp, seed, n, paper, spread=0.28):
    """Continuous tone + grain, mapped through paper → light → brand → deep."""
    rng = np.random.default_rng(seed)
    d = rings(w, h, rng, n, spread)
    # 2px grain, heavier in the ink, so it reads at 1x like risograph speckle.
    g = rng.normal(0, 1, (-(-h // 2), -(-w // 2))).repeat(2, 0).repeat(2, 1)[:h, :w]
    d = d + 0.16 * g * (0.3 + d) + 0.06 * rng.normal(0, 1, d.shape)
    d = np.clip(d, 0, 1.3) / 1.3
    stops = np.array([0, 0.25, 0.55, 1.0], np.float32)
    cols = np.array([paper] + ramp, np.float32)
    rgb = np.stack([np.interp(d, stops, cols[:, c]) for c in range(3)], -1)
    rgb += rng.normal(0, 4, (h, w, 1))  # paper tooth
    return Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8))


def render(w, h, color, seed, grain, gamma, paper, edge=0.45, soft=0.25):
    rng = np.random.default_rng(seed)
    d = density(w, h, rng)
    # Smoothstep around `edge` gives solid cores, a speckled band, clean paper.
    t = np.clip((d - (edge - soft)) / (2 * soft), 0, 1)
    d = (t * t * (3 - 2 * t)) ** gamma
    gh, gw = -(-h // grain), -(-w // grain)
    noise = rng.random((gh, gw)).repeat(grain, 0).repeat(grain, 1)[:h, :w]
    ink = (noise < d).astype(np.float32)
    # Slight tonal variation inside the ink so solid cores aren't flat.
    tone = 0.88 + 0.12 * rng.random((h, w))
    c = np.array(color, np.float32)
    p = np.array(paper, np.float32)
    rgb = p + (c * tone[..., None] - p) * ink[..., None]
    return Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8))


def hex_rgb(s):
    s = s.lstrip('#')
    return tuple(int(s[i:i + 2], 16) for i in (0, 2, 4))


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--width', type=int, default=1800)
    ap.add_argument('--height', type=int, default=1300)
    ap.add_argument('--color', default='2a9c64')
    ap.add_argument('--paper', default='ffffff')
    ap.add_argument('--seed', type=int, default=7)
    ap.add_argument('--grain', type=int, default=2, help='speck size in px')
    ap.add_argument('--gamma', type=float, default=1.0, help='>1 = more white, tighter cores')
    ap.add_argument('--edge', type=float, default=0.45, help='density where ink is 50%%')
    ap.add_argument('--soft', type=float, default=0.25, help='width of the speckled band')
    ap.add_argument('--style', choices=['blobs', 'rings'], default='blobs')
    ap.add_argument('--rings', type=int, default=4, help='loop count for --style rings')
    ap.add_argument('--spread', type=float, default=0.28, help='how far loops stray from centre (fraction of width)')
    ap.add_argument('--ramp', default='9fe3bf,2a9c64,135c39', help='light,brand,deep for --style rings')
    ap.add_argument('--tiles', type=int, default=1, help='split into N side-by-side tiles (one continuous texture)')
    ap.add_argument('--gap', type=int, default=24, help='px between tiles, at output size (12px gap at 2x = 24)')
    ap.add_argument('--out', default='grain.png')
    a = ap.parse_args()
    if a.style == 'rings':
        im = render_soft(a.width, a.height, [hex_rgb(c) for c in a.ramp.split(',')], a.seed, a.rings,
                         hex_rgb(a.paper), a.spread)
    else:
        im = render(a.width, a.height, hex_rgb(a.color), a.seed, a.grain, a.gamma, hex_rgb(a.paper), a.edge, a.soft)
    if a.tiles == 1:
        im.save(a.out, optimize=True)
        raise SystemExit(print(a.out))
    tw = (a.width - a.gap * (a.tiles - 1)) / a.tiles
    stem, ext = a.out.rsplit('.', 1)
    for i in range(a.tiles):
        x = round(i * (tw + a.gap))
        path = f'{stem}-{i + 1}.{ext}'
        im.crop((x, 0, x + round(tw), a.height)).save(path, optimize=True)
        print(path)
