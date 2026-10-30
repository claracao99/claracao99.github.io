## What this is

Clara Cao's personal design portfolio, live at https://claracao.work/.
Deployed to GitHub Pages from `main` via `.github/workflows/deploy.yml`.

Repo: `claracao99/claracao99.github.io` — a GitHub **user site**, so it serves
from the domain root and `astro.config.mjs` deliberately has **no `base`**.
Don't add one: absolute links (`/closeup.css`, `/favicon.svg`) would then work
in dev and 404 in production.

### The homepage is the Close-up site, static files in `public/`

`/` is the static **Close-up** site: `public/index.html`, `closeup*.js/css`,
`filter-demo.*`, `laptop3d.js`, `studio.js`, `play-lamp.js`, `assets/`
(media in `assets/closeup/`, fonts in `assets/fonts/`) and `vendor/three/`.
Its source is `~/Projects-personal/laptop-scroll` (`closeup.html` →
`public/index.html`, with the favicon, OG meta and GoatCounter added): change
it there, copy the changed files over unchanged, build, push. Project copy
lives in `closeup-content.js`. Navigation is by hash (`#work`,
`#work/<slug>`, `#about`); there is no `#play` deep link.

Astro builds one page, the 404 (`src/pages/404.astro`). It is standalone: it
links `/closeup.css` (absolute, so deep URLs get the styles), copies the
Close-up header and carries its own theme toggle. GitHub Pages serves it for
every missing address. The previous Astro site (index rail, `/work/<slug>/`
case pages, MDX content, tokens, components) was removed on 2026-10-30; it
is in git history if anything is ever needed from it.

Tab titles follow the page and never use a mid dot: `Clara Cao` on the work,
`<Project> – Clara Cao` and `About – Clara Cao` (en dash), set in
`closeup.js` (`openCase`, `show`); the 404 is `Page not found – Clara Cao`.
The favicon is the pill in white on a black tile; the SVG is the source,
`favicon.ico` (16/32/48) and the full-bleed `apple-touch-icon.png` are
rendered from it with `magick`. Decisions board: Figma Portfolio file, page
"Favicon, tab name, description".

### The CV is never published

`cv/` (source, build script, PDF) is gitignored and local only. Nothing on the
site links to a CV, and `public/cv.pdf` was deleted and purged from history on
2026-10-30 at Clara's request. Don't add a CV to `public/` without asking.

## Hard constraints

This site must outlive Clara's current job. Nothing may couple it to employer
infrastructure:

- **No `.npmrc`.** If one appears in this repo, that's a leak. All deps resolve
  from the public npm registry.
- **No internal/company packages** (no `@bolteu/*`, no internal design system).
  Dependencies stay limited to `astro` and `@astrojs/*`.
- **No company email in git history.** The repo lives under
  `~/Projects-personal/` so `~/.gitconfig`'s `includeIf` applies the personal
  identity. After any folder move, re-check `git config user.email` **before**
  committing — it must be the `users.noreply.github.com` address.
- **`origin` must stay SSH**, using the `github.com-personal` alias. An HTTPS
  remote pushes as whichever `gh` account is currently active, which can
  silently be the work one.
- **Self-host fonts** as woff2 in `public/assets/fonts/` with
  `font-display: swap`. No Google Fonts CDN, and no typeface licensed through
  an employer. The site ships Inter (SIL OFL). ABC Diatype is named first in
  the font stack but only shows where it is installed locally: its web licence
  isn't bought, so its files must not be committed.

## Conventions

- **Images and video:** downsize before committing (masters ~2500px on the
  long edge); git keeps every version forever. Anything confidential (NDA
  work, unannounced projects) stays out of the repo entirely: everything in
  `public/` is publicly fetchable whether or not a page links to it.
- **Responsive:** mobile-first. Use `svh` (not `vh`/`dvh`) for full-height
  sections so the iOS URL-bar collapse doesn't reflow the layout. Tap targets
  ≥ 44px. Honour `prefers-reduced-motion`.
- Verify with `npm run build && npm run preview`, not just `dev`.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.
