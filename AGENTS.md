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
  Google Fonts CDN, and no typeface licensed through an employer.

## Conventions

- **Styling:** every colour, type step and spacing value lives in
  `src/styles/tokens.css` as a custom property. Components consume tokens only
  — no literal hex outside that file. Art direction is still being settled, so
  the palette must remain a one-file change.
- **Adding a case study:** drop one `.mdx` file into `src/content/work/` with a
  co-located cover image. No code changes needed. The filename is the slug.
  `draft: true` entries render in `astro dev` but are excluded from builds.
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
