# claracao99.github.io

Clara Cao's personal design portfolio. Astro static site, deployed to GitHub
Pages.

**Live:** https://claracao99.github.io/

## Quick start

```sh
npm install
npm run dev          # http://localhost:4321
```

| Command | Does |
| --- | --- |
| `npm run dev` | Dev server with hot reload. Shows `draft: true` case studies. |
| `npm run build` | Production build into `dist/`. Excludes drafts. |
| `npm run preview` | Serve the built site. **Check here before pushing** — dev doesn't optimise images or bundle scripts, so some problems only appear in a real build. |
| `npx astro check` | Type-check `.astro` and `.ts` files. |

Node version is pinned in `.nvmrc` (24). Any Node ≥ 22.12 works locally.

## Adding a case study

Drop one file into `src/content/work/`, with its cover image beside it. No code
changes.

```
src/content/work/
  redesigning-checkout.mdx
  redesigning-checkout.cover.png
```

```yaml
---
title: Redesigning checkout
summary: One or two sentences. Shows on the work index and in link previews.
role: Product design, prototyping
client: Example Co.        # optional
year: 2026
cover: ./redesigning-checkout.cover.png
coverAlt: ''               # '' is correct for a purely decorative cover
tags: [Mobile, Design systems]
order: 1                   # lower sorts first; ties break by year, descending
draft: true                # visible in dev, excluded from the built site
externalUrl: https://...   # optional: index links out, no case-study page
---
```

The **filename is the URL slug** — `redesigning-checkout.mdx` becomes
`/work/redesigning-checkout/`. There's no `slug` field to drift out of sync.

The schema is enforced at build time (`src/content.config.ts`), so a typo in
frontmatter fails the build with a useful message rather than shipping broken.

`src/content/work/example-project-{one,two}.mdx` are worked examples, both
`draft: true`. Copy one to start.

### `draft: true` hides the page, not the images

A draft's cover image is still emitted to `dist/_astro/` with a hashed
filename, so it's publicly fetchable even though nothing links to it. For
genuinely confidential work, **keep the images out of the repo** — don't rely
on the draft flag.

## Styling

Every colour, type step and spacing value lives in `src/styles/tokens.css`.
Components reference tokens only; there is no literal hex anywhere else. The
art direction is still open, so re-theming should stay a one-file change.

Tokens are two-tier on purpose:

- a **ramp** (`--neutral-40`, `--accent`) — raw values
- a **semantic layer** (`--ink`, `--surface`, `--rule`, `--link`) — what
  components actually use

Dark mode reassigns only the semantic layer, which is why it's about 15 lines
at the bottom of the file.

`src/styles/base.css` holds element defaults and a few utilities (`.wrap`,
`.button`, `.visually-hidden`, `.skip-link`).

### Responsive rules worth keeping

- Mobile-first. No fixed pixel widths on anything full-bleed — that was the
  previous site's core bug.
- Use `svh`, not `vh` or `dvh`, for full-height sections, so the iOS URL bar
  collapsing doesn't reflow the layout.
- Tap targets ≥ 44px via `min-height` rather than padding, so they hold
  regardless of how the fluid font size resolves. Inline links inside prose are
  exempt — an inline word can't take a 44px target without breaking the line.
- Motion goes through the `--duration-*` tokens, which
  `prefers-reduced-motion` zeroes globally.

### Images

Put them in `src/assets/` or beside the MDX so `astro:assets` optimises them —
never `public/`, which bypasses optimisation.

**Downsize before committing.** Cap masters at ~2500px on the long edge; git
keeps every version forever and design exports are often multi-MB.

For images with transparency, set `format`/`fallbackFormat` to `webp`
explicitly. A JPEG fallback flattens alpha onto black, and the regression is
invisible in dev — it only shows up in `astro preview`.

## Structure

```
src/
  consts.ts              site name, nav links
  content.config.ts      case-study schema
  lib/work.ts            draft filtering + sort order (used everywhere)
  layouts/
    BaseLayout.astro     <head>, meta/OG, skip link
    PageLayout.astro     standard content page
    CaseStudyLayout.astro
  components/            Nav, Footer, WorkCard, Skeleton
  pages/                 routes; [...slug].astro builds case studies
  styles/                tokens.css, base.css
```

`lib/work.ts` is the one place the draft rule and sort order are defined, so
the index and the routes can't disagree about what's published.

## Deployment

Push to `main`. `.github/workflows/deploy.yml` builds and publishes to Pages;
takes about a minute. Pages is set to **Source: GitHub Actions** — if it ever
reverts to branch-based it'll serve the raw repo instead of the built site.

This is a GitHub **user site**, so it serves from the domain root and
`astro.config.mjs` deliberately has **no `base`**. Don't add one — it leaks
into `getStaticPaths` slugs, hrefs and `BASE_URL`, and absolute links then work
in dev but 404 in production.

### Custom domain, later

Add `public/CNAME` with the bare domain, point DNS at `claracao99.github.io`,
enable Enforce HTTPS in repo settings, and update `site` in `astro.config.mjs`
so canonical URLs and the sitemap follow. Nothing else changes, because there's
no `base`.

## Constraints

See [AGENTS.md](./AGENTS.md). Short version: this site must outlive any
employer, so no `.npmrc`, no internal packages, no work email in git history,
SSH-only `origin`, and self-hosted fonts only.
