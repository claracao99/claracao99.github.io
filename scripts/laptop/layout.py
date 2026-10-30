"""
Place the stickers on the lid. Bolt always sits upright at the exact centre
(where Apple's logo would be), bigger than the rest, with more room round it
and the quiet paper stamps either side, so it's the first sticker the eye
lands on. Its row grows out from it; the rows above and below stack from
there, each centred. Every other sticker is nudged and tilted a little, as if
stuck on by hand. Writes
assets/layout.json (millimetres on a MacBook Pro 16" lid, seen from behind
with the lid open; y runs down from the lid's top edge).

  python3 scripts/layout.py
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2] / 'public'
LID = (355.7, 248.1)  # mm
MM_PER_PX = 0.33  # one Figma px of a stamp, in mm
S = 0.78  # sticker scale
GUTTER = 16  # mm
CENTRE = 'bolt'
CENTRE_SCALE = 1.4  # Bolt's size against the others
CENTRE_GUTTER = 22  # mm either side of Bolt
# Bolt is flanked by the two cream paper stamps; the dog's face, which would
# pull the eye first, goes to a corner. Similar colours kept apart: the
# yellows (Hyrox, Claude Code, matcha), the oranges (21.1 km, clay), the navy
# rectangles (tweak, teriyaki).
ROWS = [
    ['chihuahua', 'hyrox', 'hand-gestures', 'half-marathon'],
    ['cheesecake', CENTRE, 'tweak'],
    ['teriyaki', 'matcha', 'clay', 'claude-code'],
]
ROW_SHIFT = {0: -4, 2: 5}  # mm, so the outer rows don't stack symmetrically
# Round shapes look smaller than their boxes; space them by a little less.
OPTICAL = {'half-marathon': 0.95, 'cheesecake': 0.95, 'hand-gestures': 0.93, 'claude-code': 0.96, 'chihuahua': 0.96}
# Hand placement: (dx mm, dy mm, degrees clockwise)
NUDGE = {
    'chihuahua': (-4, 4, -6), 'hyrox': (2, -3, 4), 'hand-gestures': (-2, 3, -5), 'half-marathon': (4, 2, 7),
    'cheesecake': (-2, 2, 8), 'tweak': (2, -2, -3),
    'teriyaki': (-3, -2, -4), 'matcha': (2, 3, 5), 'clay': (2, -2, -3), 'claude-code': (4, 3, 6),
}


def main():
    meta = json.loads((ROOT / 'assets/stickers/meta.json').read_text())
    k = MM_PER_PX * S
    scale = {n: (CENTRE_SCALE if n == CENTRE else 1) for r in ROWS for n in r}
    size = {n: (meta[n]['w'] * k * scale[n] * OPTICAL.get(n, 1), meta[n]['h'] * k * scale[n] * OPTICAL.get(n, 1)) for n in scale}
    heights = [max(size[n][1] for n in r) for r in ROWS]
    m = next(i for i, r in enumerate(ROWS) if CENTRE in r)
    cx, cy = LID[0] / 2, LID[1] / 2

    # each row's centre line, stacked out from the centre row
    ys = {m: cy}
    for i in range(m - 1, -1, -1):
        ys[i] = ys[i + 1] - heights[i + 1] / 2 - GUTTER - heights[i] / 2
    for i in range(m + 1, len(ROWS)):
        ys[i] = ys[i - 1] + heights[i - 1] / 2 + GUTTER + heights[i] / 2

    spots = {}
    for i, row in enumerate(ROWS):
        if i == m:
            # out from the centre sticker in both directions
            c = row.index(CENTRE)
            spots[CENTRE] = (cx, cy)
            x = cx - size[CENTRE][0] / 2
            for j, n in enumerate(reversed(row[:c])):
                g = CENTRE_GUTTER if j == 0 else GUTTER
                spots[n] = (x - g - size[n][0] / 2, cy)
                x -= g + size[n][0]
            x = cx + size[CENTRE][0] / 2
            for j, n in enumerate(row[c + 1:]):
                g = CENTRE_GUTTER if j == 0 else GUTTER
                spots[n] = (x + g + size[n][0] / 2, cy)
                x += g + size[n][0]
        else:
            width = sum(size[n][0] for n in row) + GUTTER * (len(row) - 1)
            x = (LID[0] - width) / 2 + ROW_SHIFT.get(i, 0)
            for n in row:
                spots[n] = (x + size[n][0] / 2, ys[i])
                x += size[n][0] + GUTTER

    items = []
    for row in ROWS:
        for n in row:
            dx, dy, r = (0, 0, 0) if n == CENTRE else NUDGE.get(n, (0, 0, 0))
            item = [n, round(spots[n][0] + dx, 1), round(spots[n][1] + dy, 1), r]
            items.append(item + [scale[n]] if scale[n] != 1 else item)
    missing = set(meta) - {i[0] for i in items}
    if missing:
        print('not placed:', ', '.join(sorted(missing)))
    out = {'lid_mm': list(LID), 'mm_per_px': MM_PER_PX, 's': S, 'items': items}
    (ROOT / 'assets/layout.json').write_text(json.dumps(out, indent=1) + '\n')
    top = ys[0] - heights[0] / 2
    bottom = LID[1] - (ys[len(ROWS) - 1] + heights[-1] / 2)
    print(f'{len(items)} stickers, {CENTRE} at the centre; margins top {top:.1f} mm, bottom {bottom:.1f} mm')


if __name__ == '__main__':
    main()
