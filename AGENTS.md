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
  faces, all SIL OFL: Special Gothic Expanded One (wordmark), Mona Sans
  (body), Fragment Mono (numbers, years) and Instrument Serif (case titles).

## Conventions

- **Styling:** every colour, type step and spacing value lives in
  `src/styles/tokens.css` as a custom property. Components consume tokens only
  — no literal hex outside that file. Art direction is still being settled, so
  the palette must remain a one-file change.
- **Adding a case study:** drop one `.mdx` file into `src/content/work/`.
  No code changes needed. The filename is the
  slug. `draft: true` entries render in `astro dev` but are excluded from
  builds. Frontmatter is documented in README.
- **Index and case pages are square tiles.** On phones a tile is the
  screen's width less the 10px margins, so it fills the phone; from 32rem it
  is a fixed 240px, two to a row, and only the side space grows
  (`--tile-size`). Keep `TILE_PX` in `lib/media.ts` in step.
  The index's tiles are the header switch's view: Work (the projects) or
  Play (side projects, so far the lamp, LampTile.astro with
  `data-view="play"`); index.astro listens for `index-view`.
  `/work/<slug>/` pages use `TilePage.astro`: one column the grid's
  full width, the cover (the index card's own picture), then a Figure card as
  tall as its text (Information = short project name as h1, company, year;
  Description = summary + MDX body), then the frontmatter `media` (`size:
  small` = square, `large` = its own ratio). The header pill is the way back.
  Media without `src` is a placeholder tile; no `media` at all gets a default
  placeholder set, and `media: []` means the cover alone. Layout lives in
  `src/styles/case.css` (global, because MDX output has no scope).
- **From 48rem the index is the rail** (index.astro): a fixed, vertically
  centred, endlessly looping row of tiles that turn in 3D by their distance
  from the middle (after details.so's Perspective Cards). The page itself
  never scrolls there (`html:has(.rail[data-active])` is overflow hidden,
  Lenis stopped); the wheel, arrow keys, focus and touch drags move the row.
  The row is `preserve-3d` with `pointer-events: none` and only the tiles
  take the pointer: otherwise the row's plane, level with the middle tile,
  swallows its clicks. Read `calc()` tokens in script through a property
  that resolves them (the rail reads `--rail-gap` via `column-gap`);
  `getPropertyValue` returns the unresolved string. On the rail there is no
  cursor frame and no open-tile choreography (below): tiles open straight
  away. Phones and reduced motion keep the grid.
- **The header** (Nav.astro): wordmark as bare text, the Work / Play switch,
  About. Its pills are rounded rectangles joined by a pinched neck, after
  anima.ai, drawn as a clip-path from each `[data-seam]`'s left edge (so the
  glass blur is clipped too) and redrawn as parts resize. The switch and
  About each open into a panel (Jeton-style) by animating the box's width
  and height in px; their contents keep the open width and are uncovered.
  A `.pill` is `display: flex` with a gap: a pill used as a column container
  needs `gap: 0`, or the panel's measured height comes up short and the
  bottom is clipped. Phones' pills get a 44px tap layer (`.pill::after`),
  which must be off on pills that contain other controls.
- **Opening a tile is choreographed** on the grid (phones; index.astro, TilePage.astro, case.css
  Entrance): the tile lingers in an outline while the index fades to the
  blinking loading squares, the outline grows into the cover's big square,
  and the case page opens on the same squares and outline (handed over in
  sessionStorage `tile-handoff`), then the cover fills it, then the card,
  then the rest. A touch tap skips the outline (it looked bad without a
  cursor frame leading into it): the tile just fades with the others. The
  header is pinned on desktop and holds still through page changes (named
  only while a page transition runs, PageTransition.astro); on phones it
  scrolls with the page. The
  outline and cursor frame sit under the sticky nav (`--z-cursor-frame` <
  `--z-nav`). Anything the next page must show from its first frame has
  to be set by an inline script *before* that element is parsed, or it fades
  in from its default instead. The squares' blink phases are handed over
  too, and a CSS `animation-delay` counts from when the animation started
  (the index's page load), not from when it's set: anchor it with
  `performance.now() - animation.startTime`, or every square jumps at the
  swap and the page seems to blank (`currentTime` lags a frame or more).
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
  in tokens.css. The lamp's cord turns only the lamp's glow on and off. The
  one colour is `--accent` (scarlet), used sparingly and only for what the
  pointer is acting on (the project list's gliding dot, About's cross),
  never as a fill; where you are (the switch's dot) stays ink. The lamp's
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
