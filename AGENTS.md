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
  The index: About first, the projects, the lamp last (LampTile.astro).
  `/work/<slug>/` and `/about/` share `TilePage.astro`: one column the grid's
  full width, the cover (the index card's own picture), then a Figure card as
  tall as its text (Information = short project name as h1, client, year;
  Description = summary + MDX body), then the frontmatter `media` (`size:
  small` = square, `large` = its own ratio). The header pill is the way back.
  Media without `src` is a placeholder tile; no `media` at all gets a default
  placeholder set, and `media: []` means the cover alone. Layout lives in
  `src/styles/case.css` (global, because MDX output has no scope).
- **Opening a tile is choreographed** (index.astro, TilePage.astro, case.css
  Entrance): the tile lingers in an outline while the index fades to the
  blinking loading squares, the outline grows into the cover's big square,
  and the case page opens on the same squares and outline (handed over in
  sessionStorage `tile-handoff`), then the cover fills it, then the card,
  then the rest. A touch tap skips the outline (it looked bad without a
  cursor frame leading into it): the tile just fades with the others. The
  header and footer are pinned on desktop and hold still through all of it
  (named only while a page transition runs, PageTransition.astro); on phones
  both scroll with the page and the footer fades with the tiles. The
  outline and cursor frame sit under the sticky nav (`--z-cursor-frame` <
  `--z-nav`). Anything the next page must show from its first frame has
  to be set by an inline script *before* that element is parsed, or it fades
  in from its default instead.
- **Crossfades must add, not stack.** View-transition crossfades use
  `mix-blend-mode: plus-lighter` (PageTransition.astro); setting `animation`
  on `::view-transition-old/new` drops the UA's, and two 50% layers then show
  the backdrop through as a blink. The theme switch is a same-document View
  Transition for the same reason: per-element colour transitions restart
  every frame on an element that sets its own colour inside one inheriting a
  changing colour (the footer's "Copy" lagged far behind). Its snapshots
  drop `backdrop-filter`, so glass pills flashed see-through: each glass
  pill gets its own live layer during the switch (`match-element`, class
  `glass`, base.css) and the `::view-transition-group` carries the blur over
  the crossfade beneath. Don't lift whole cards instead: their layers paint
  over the header (which sits in the root snapshot) until the fade ends.
  Lifted layers paint over everything left in the root snapshot, whatever its
  z-index: anything that must stay on top (the cursor) needs its own named
  layer too. Inside a glass pill, nothing may run its own colour transition
  (same restart problem): "Copy" inherits the pill's colour at
  `--ink-detail-alpha` opacity, and the arrows only ease `fill`.
- **The scrollbar's room is always kept** (`scrollbar-gutter: stable` on
  html). The column is centred, so a classic scrollbar coming and going
  (Lenis stopped on a tile click, a case page held during its entrance)
  nudged every column sideways.
- **Palette** from the Figma file: a `--grey-*` ramp plus a semantic layer.
  Dark mode is a ramp override (`:root[data-theme='dark']` in tokens.css),
  switched only by pulling the lamp's cord (Lamp.astro, lib/theme.ts); the
  site always opens light. Don't key it to `prefers-color-scheme`. The lamp's
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
