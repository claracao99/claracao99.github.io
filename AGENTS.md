## What this is

Clara Cao's personal design portfolio. Astro static site, deployed to GitHub
Pages from `main` via `.github/workflows/deploy.yml`.

Repo: `claracao99/claracao99.github.io` — a GitHub **user site**, so it serves
from the domain root and `astro.config.mjs` deliberately has **no `base`**.
Don't add one: `base` leaks into `getStaticPaths` slugs, `<a href>`s and
`import.meta.env.BASE_URL`, and hand-written absolute links silently work in
dev then 404 in production.

## Hard constraints

This site must outlive Clara's current job. Nothing may couple it to employer
infrastructure:

- **No `.npmrc`.** If one appears in this repo, that's a leak. All deps resolve
  from the public npm registry.
- **No internal/company packages** (no `@bolteu/*`, no internal design system).
  Dependencies should stay limited to `astro`, `@astrojs/*` and `sharp`.
- **No company email in git history.** The repo lives under
  `~/Projects-personal/` so `~/.gitconfig`'s `includeIf` applies the personal
  identity. After any folder move, re-check `git config user.email` **before**
  committing — it must be the `users.noreply.github.com` address.
- **`origin` must stay SSH**, using the `github.com-personal` alias. An HTTPS
  remote pushes as whichever `gh` account is currently active, which can
  silently be the work one.
- **Self-host fonts** as woff2 in `src/fonts/` with `font-display: swap`. No
  Google Fonts CDN, and no typeface licensed through an employer. Current
  faces, all SIL OFL: Mona Sans (body, and the wordmark in bold caps),
  Fragment Mono (numbers, years) and Instrument Serif (case titles).

## Conventions

- **Styling:** every colour, type step and spacing value lives in
  `src/styles/tokens.css` as a custom property. Components consume tokens only
  — no literal hex outside that file. Art direction is still being settled, so
  the palette must remain a one-file change.
- **Adding a case study:** drop one `.mdx` file into `src/content/work/`.
  No code changes needed. The filename is the
  slug. `draft: true` entries render in `astro dev` but are excluded from
  builds. Frontmatter is documented in README.
- **Index and case pages are square tiles.** On case pages (and the
  index's reduced-motion grid) a phone's tile is the screen's width less the
  10px margins, so it fills the phone; from 32rem it is a fixed 240px, two to
  a row, and only the side space grows (`--tile-size`). Keep `TILE_PX` in
  `lib/media.ts` in step. The index rail has its own size (`--rail-tile`:
  `min(68vw, 40svh)` on phones, bigger from 48rem; `RAIL_VW`/`RAIL_PX`).
  The index's tiles are the header switch's view: Work (the projects) or
  Play (side projects, so far the lamp, LampTile.astro with
  `data-view="play"`); index.astro listens for `index-view`.
  `/work/<slug>/` pages use `TilePage.astro`: one column the grid's
  full width, the cover (the index card's own picture), then a Figure card as
  tall as its text (Information = short project name as h1, company, year;
  Description = summary + MDX body), then the frontmatter `media` (`size:
  small` = square, `large` = its own ratio). The header pill is the way back.
  (Tried and reverted 2026-10-25: the case as a window over the index,
  centred, media left and text right; Clara went back to the page.)
  Media without `src` is a placeholder tile; no `media` at all gets a default
  placeholder set, and `media: []` means the cover alone. Layout lives in
  `src/styles/case.css` (global, because MDX output has no scope).
- **The index is the rail at every width** (index.astro): a fixed, vertically
  centred row with two ends — first the intro (`.rail-intro`, flat: big
  name, SITE.intro, CONTACT; the header wordmark is hidden on landing and
  rolls up into its clipped box, partizan.com-style, once the big name is
  mostly off-screen: `data-name-in` on html), then Work's projects, an arrow in a tile's room
  (`.rail-divider`), then Play's — opening with the first project dead
  centre, the intro beside it. Its ends are that landing (it never goes
  back further, so there's no empty half screen before the intro, unless
  the intro is cut off there: then it goes back until the intro lines up
  with the wordmark) and the last tile centred, and every tile the row brings to the middle (switch, arrow
  keys, focus, a tap) lands exactly centred; free scrolling doesn't snap;
  the header switch follows which half is centred and glides the row to
  the other, and the wordmark (on the index) glides it back to the
  landing (on the grid: back to Work, scrolled to the top). Those jumps are
  one cubic in-out tween, `--duration-row` whatever the distance, never
  the wheel's lerp (that lurches at the start and trails off); a wheel
  turn or a drag takes over from one mid-glide. Play has its own white ground (`.rail__play-bg`): a clean-cut
  layer that sweeps in behind the row faster than it (parallax,
  `--play-speed`), from the arrow reaching the window's right. Tiles turn in 3D by their distance
  from the middle (after details.so's Perspective Cards). The page itself
  never scrolls there (`html:has(.rail[data-active])` is overflow hidden,
  Lenis stopped); the wheel, arrow keys, focus and touch drags move the row.
  The row is `preserve-3d` with `pointer-events: none` and only the tiles
  take the pointer: otherwise the row's plane, level with the middle tile,
  swallows its clicks. Read `calc()` tokens in script through a property
  that resolves them (the rail reads `--rail-gap` via `column-gap`);
  `getPropertyValue` returns the unresolved string. On the rail there is no
  cursor frame and no open-tile choreography (below): tiles open straight
  away. Reduced motion keeps the grid.
  **Phones (under 48rem)** run the same rail, one tile to the screen with a
  slice of each neighbour: the intro can't stand beside the first project,
  so it frames the row instead, from the wordmark's left edge (name and
  about above, contacts below, absolutely placed off the intro box) and
  slides off with the row; the script pads the stage (`--rail-above`,
  `--rail-below`) so the three stand centred under the header, and the
  wordmark rolls in as on desktop. A tile reaches its full turn 1.6 steps
  out (`span`), not at the window's edge, or the neighbours would be fully
  turned. Letting go of a swipe settles on a tile (`settle`: projected
  from the finger's speed, a flick at least one tile, a Hermite tween that
  picks up that speed); a finger on a moving row catches it without
  opening a tile. On touch, only the centred tile (`data-centre`) shows its
  title pill. Tapping the switch's other half only glides; tapping the
  half you're on opens its panel.
- **The header** (Nav.astro): wordmark as bare text and the Work / Play
  switch (no About: the intro at the row's start, or the grid's top, is
  the about). Its
  pills are rounded rectangles joined by a pinched neck, after
  anima.ai, drawn as a clip-path from each `[data-seam]`'s left edge (so the
  glass blur is clipped too) and redrawn as parts resize. Each half of the
  switch opens into a panel (Jeton-style) by animating the box's width
  and height in px; their contents keep the open width and are uncovered.
  A `.pill` is `display: flex` with a gap: a pill used as a column container
  needs `gap: 0`, or the panel's measured height comes up short and the
  bottom is clipped. Phones' pills get a 44px tap layer (`.pill::after`),
  which must be off on pills that contain other controls.
- **Opening a tile: dolly in, then one View Transition** (index.astro,
  PageTransition.astro). On the rail, `dollyIn` first glides a tile
  that's off to the side to the middle (cubic in-out, `--duration-centre`,
  longer the further it is), then tweens a `dolly` 0→1 there
  (`--duration-dolly`): the chosen tile grows a
  touch (as `scale`, never `translateZ`: the transition captures tiles
  without the stage's perspective, so a z push jumps at hand-off), the rest
  sink back in z, part, turn further and blur/dim. Then the page opens and
  the tile (`case-tile`, named only while `data-vt-cover` marks it and
  `data-vt-tile` is on html) grows into the cover; only the bigger snapshot
  shows (`data-vt-dir` open/close), the group rounds the corners. Back
  reverses it: the rail opens pushed in on that tile and `dollyOut` gathers
  the drum live under the transition, phones included.
  Case → case crossfades. No loading screen. Case pages are prefetched
  eagerly and prerendered on hover (speculation rules) so there's no hold.
  The header is pinned on desktop and holds still through page changes;
  on phones' case pages it scrolls with the page (the index never
  scrolls). Its middle pill, index ↔ case, is
  one live shape, not snapshots (lib/nav-morph.ts): the leaving page saves
  its pill on `pageswap`, the arriving page hides its real one
  (`data-nav-stand-in`) and morphs a stand-in from the saved shape into it,
  part for part: Work's part becomes Back's (a word, no icon, no hover fill)
  and Play's the name's (which carries the switch's dot, "where you are"),
  the neck sliding between, labels tick over in their own parts
  (up opening, down closing), the wordmark rolls (`data-name-hold`). The
  old header is hidden from the transition and the header is never renamed
  mid-transition (`data-nav-morph` stays till it ends): a part that gains a
  view-transition-name mid-way drops out of view. The stand-in re-measures
  the real pill every frame and is timed by a WAAPI animation, so paused or
  seeked transitions freeze it too. Till it has drawn its first frame
  (`data-nav-ready`) the transition keeps showing the old header, so a page
  that paints before its script runs never shows an empty middle. Cross-document view-transition
  pseudos are styled by the *new* page, and a group already on the old
  page keeps its old stacking place, under any group new on the arriving
  one (lift it with `z-index` on its `::view-transition-group`).
  Read duration tokens in script with `cssMs` (lib/css.ts), never bare
  `parseFloat`: the build's minifier rewrites `600ms` as `.6s`, so every
  wait collapses to under a millisecond, live only (dev isn't minified).
- **Crossfades must add, not stack.** View-transition crossfades use
  `mix-blend-mode: plus-lighter` (PageTransition.astro); setting `animation`
  on `::view-transition-old/new` drops the UA's, and two 50% layers then show
  the backdrop through as a blink.
- **The scrollbar's room is always kept** (`scrollbar-gutter: stable` on
  html). The column is centred, so a classic scrollbar coming and going
  (Lenis stopped on a tile click, a case page held during its entrance)
  nudged every column sideways.
- **Palette** from the Figma file: a `--grey-*` ramp plus a semantic layer.
  The site is dark only: `<html data-theme="dark">` applies the ramp override
  in tokens.css; its page is a dark grey (#181818), not black, with
  off-white ink. Anything sitting on Play's white ground (wordmark, header
  switch, the Work→Play arrow) swaps to the `--play-*` ink/glass tokens via
  a `data-on-play*` attribute set as the white's edge passes it.
  The lamp's cord turns only the lamp's glow on and off.
  No accent colour: the UI is ink and greys only (the scarlet went once its
  last use, the project list's gliding dot, turned ink). The lamp's
  switch only clicks while the cord is held: settling on load used to flip it.
- **`draft: true` hides the page, not the images.** Verified: a draft's cover
  image is still emitted to `dist/_astro/` with a hashed filename, so it is
  publicly fetchable even though nothing links to it. For anything genuinely
  confidential (NDA work, unannounced projects), keep the images out of the
  repo entirely — don't rely on the draft flag.
- **Images:** put them in `src/assets/` or beside the MDX so `astro:assets`
  optimises them — never `public/`, which bypasses optimisation entirely.
  **Downsize before committing:** cap masters at ~2500px on the long edge, as
  git keeps every version forever and design exports are often multi-MB.
  For any image with transparency, set `format`/`fallbackFormat` to `webp`
  explicitly — a JPEG fallback flattens alpha onto black, and the regression is
  invisible in dev and only shows up in `astro preview`.
- **Responsive:** mobile-first. Use `svh` (not `vh`/`dvh`) for full-height
  sections so the iOS URL-bar collapse doesn't reflow the layout. Tap targets
  ≥ 44px. Honour `prefers-reduced-motion`.
- Verify with `npm run build && npm run preview`, not just `dev` — dev serves
  unbundled modules and unoptimised images.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
