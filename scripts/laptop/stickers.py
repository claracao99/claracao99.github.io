"""
Make the lid's stickers from Clara's stamps in Figma.

Exports every stamp in the "Final shortlist" section (Portfolio file, page
"Stamp", 614:364) at 3x, turns tilted ones upright (the layout sets its own
angles), backs the ink-only rubber stamps with paper, gives the coloured
shapes a white die-cut vinyl border, and writes assets/stickers/<slug>.png
plus meta.json (each sticker's size in Figma px, border included).

Needs a Figma token in ~/.figma-token.

  python3 scripts/stickers.py
"""

import json
import math
import re
import urllib.request
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

FILE = 'YltpKPrfNmb1jwlKzOnVLQ'
SECTION = '614:364'
SCALE = 3
OUT = Path(__file__).resolve().parents[2] / 'public' / 'assets' / 'stickers'

# Frame name -> slug, by the first word that matches.
SLUGS = {
    'clay': 'clay', 'tweak': 'tweak', 'hyrox': 'hyrox', '21.1': 'half-marathon',
    'teriyaki': 'teriyaki', 'cheesecake': 'cheesecake', 'hand': 'hand-gestures',
    'cup': 'matcha', 'matcha': 'matcha', 'laptop': 'claude-code', 'claude': 'claude-code',
    'bolt': 'bolt', 'chihuahua': 'chihuahua',
}
# Ink-only rubber stamps get a paper to be printed on.
INKED = {'tweak': 'rect', 'cheesecake': 'circle'}
PAPER = (251, 248, 241, 255)
PAPER_MARGIN = 7  # Figma px around the ink
# Stamps with their own paper edge (postage perforations, the paper above)
# keep it; every other shape gets a white vinyl border.
OWN_EDGE = {'bolt', 'tweak', 'cheesecake'}
BORDER = 15  # px at 3x, about 5 Figma px


def figma(path):
    token = (Path.home() / '.figma-token').read_text().strip()
    req = urllib.request.Request(f'https://api.figma.com/v1/{path}', headers={'X-Figma-Token': token})
    with urllib.request.urlopen(req) as r:
        return json.load(r)


def slug_for(name):
    for word in re.findall(r'[\w.]+', name.lower()):
        if word in SLUGS:
            return SLUGS[word]
    return re.sub(r'[^a-z0-9]+', '-', name.lower().split('—')[0]).strip('-')


def upright(im, rad):
    """Undo the frame's tilt, in premultiplied alpha so edges don't go dark.
    Tries both directions and keeps the one with the tighter box."""
    if abs(rad) < 1e-4:
        return im
    a = np.asarray(im).astype(np.float32) / 255
    chans = [Image.fromarray(a[..., i] * a[..., 3]) for i in range(3)] + [Image.fromarray(a[..., 3])]
    best = None
    for sign in (1, -1):
        rot = [c.rotate(sign * math.degrees(rad), resample=Image.BICUBIC, expand=True) for c in chans]
        ys, xs = np.nonzero(np.asarray(rot[3]) > 0.03)
        area = (np.ptp(xs) + 1) * (np.ptp(ys) + 1)
        if best is None or area < best[0]:
            best = (area, rot)
    rot = best[1]
    alpha = np.clip(np.asarray(rot[3]), 0, 1)
    rgb = np.stack([np.asarray(c) for c in rot[:3]], -1) / np.maximum(alpha[..., None], 1e-4)
    out = np.dstack([np.clip(rgb, 0, 1), alpha]) * 255
    return Image.fromarray(out.round().astype(np.uint8))


def trim(im):
    return im.crop(im.getchannel('A').point(lambda a: 255 if a > 8 else 0).getbbox())


def back_with_paper(im, kind):
    alpha = np.asarray(im.getchannel('A'))
    ys, xs = np.nonzero(alpha > 24)
    m = PAPER_MARGIN * SCALE
    x0, y0, x1, y1 = xs.min() - m, ys.min() - m, xs.max() + m, ys.max() + m
    pad = max(0, -x0, -y0, x1 - im.width + 1, y1 - im.height + 1)
    canvas = Image.new('RGBA', (im.width + 2 * pad, im.height + 2 * pad), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)
    box = [x0 + pad, y0 + pad, x1 + pad, y1 + pad]
    if kind == 'circle':
        draw.ellipse(box, fill=PAPER)
    else:
        draw.rounded_rectangle(box, radius=4 * SCALE, fill=PAPER)
    canvas.alpha_composite(im, (pad, pad))
    return canvas


def die_cut(im, r):
    """A white border r px wide around the opaque shape."""
    pad = r + 4
    canvas = Image.new('RGBA', (im.width + 2 * pad, im.height + 2 * pad), (0, 0, 0, 0))
    canvas.paste(im, (pad, pad))
    mask = np.asarray(canvas)[:, :, 3] > 100
    grown = mask.copy()
    ys, xs = np.mgrid[-r:r + 1, -r:r + 1]
    for dy, dx in zip(ys.ravel(), xs.ravel()):
        if 0 < dx * dx + dy * dy <= r * r:
            grown |= np.roll(np.roll(mask, dy, 0), dx, 1)
    edge = Image.fromarray((grown * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.9))
    white = Image.new('RGBA', canvas.size, (255, 255, 255, 0))
    white.putalpha(edge)
    white.alpha_composite(canvas)
    return white


def main():
    section = figma(f'files/{FILE}/nodes?ids={SECTION}&depth=2')['nodes'][SECTION]['document']
    frames = [c for c in section['children'] if c['type'] in ('FRAME', 'GROUP', 'COMPONENT', 'INSTANCE')]
    urls = figma(f'images/{FILE}?ids={",".join(f["id"] for f in frames)}&scale={SCALE}&format=png')['images']
    OUT.mkdir(parents=True, exist_ok=True)
    for old in OUT.glob('*.png'):
        old.unlink()
    meta = {}
    for f in frames:
        slug = slug_for(f['name'])
        with urllib.request.urlopen(urls[f['id']]) as r:
            im = Image.open(r).convert('RGBA')
        im = trim(upright(im, f.get('rotation', 0)))
        if slug in INKED:
            im = trim(back_with_paper(im, INKED[slug]))
        if slug not in OWN_EDGE:
            im = die_cut(im, BORDER)
        im.save(OUT / f'{slug}.png', optimize=True)
        meta[slug] = {'w': round(im.width / SCALE, 2), 'h': round(im.height / SCALE, 2), 'name': f['name']}
        print(f'{slug:14} {im.width / SCALE:6.1f} x {im.height / SCALE:6.1f}  {f["name"]}')
    (OUT / 'meta.json').write_text(json.dumps(meta, indent=1) + '\n')


if __name__ == '__main__':
    main()
