# The About laptop's assets

Scripts that make what the laptop on About shows. They write into `public/`;
run them from the repo root.

## The stickers

The stamps come from the Portfolio Figma file, page "Stamp", section
"Final shortlist" (614:364). After changing them there:

    python3 scripts/laptop/stickers.py   # export, straighten, paper and die-cut borders
    python3 scripts/laptop/layout.py     # place them on the lid

`stickers.py` writes `public/assets/stickers/` (one PNG per sticker at 3x,
plus `meta.json`, sizes in Figma px) and needs a Figma token in
`~/.figma-token`. `layout.py` writes `public/assets/layout.json` (where each
sticker sits on the lid, in mm). A new stamp gets its slug from its frame
name; add it to a row in `layout.py`.

## The screen

    node scripts/laptop/desk.mjs

renders `desk.html` (which crops `desk-figma.html` and `desk-cursor.html`:
Figma in front of Cursor running Claude Code) at the 16" display's size into
`public/assets/closeup/desk.jpg`. The wallpaper behind them is
`inputs/screen.jpg`; `node scripts/laptop/screen.mjs <url>` captures a page
into it instead. `inputs/desk-sim.png` is the simulator in the Cursor window.

Both run Chrome through `~/Projects-personal/phone-render`'s playwright-core.

## The model

`public/assets/model/macbook.glb`: jackbaeten's "MacBook Pro M3 16 inch 2024"
on Sketchfab, CC BY 4.0. Keep the credit (in `index.html`, beside About).
`laptop3d.js` silvers its aluminium, hides the Apple logo and puts the screen
image on its display; the parts it needs are named in `PART`.
