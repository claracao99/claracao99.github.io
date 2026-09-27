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

## Structure of the site

Three routes:

- `/` — landing page: header, **Selected works** (one block per case study),
  **Fun stuff** grid. "Read more" opens the case study in a bottom sheet.
- `/about/` — bio, experience, contact.
- `/work/<slug>/` — a case study as a full page. The sheet on the landing page
  fetches this exact page and lifts its `<article class="case">` into a
  `<dialog>`, so the page must render without client JS (it does). Direct
  links, new-tab clicks, refresh and no-JS all land here.

`/work/` and `/contact/` from the previous structure redirect (see
`astro.config.mjs`).

## Adding a case study

Drop one `.mdx` file into `src/content/work/`. No code changes.

```yaml
---
title: Order for someone else
summary: One or two sentences. Landing description and meta description.
client: Bolt              # optional; shown as "BOLT · 2026" in the case study
date: Jun 2026            # display label, free text
year: 2026                # sort tiebreaker
order: 1                  # lower sorts first
draft: true               # visible in dev, excluded from the built site
media:                    # 1–3 items → 1-up / 2-up / 3-up landing row
  - src: ./hero.png       # co-located image, optimised by astro:assets
    alt: ''               # '' is correct for decorative images
  - shape: phone          # …or a placeholder until the export exists
    label: Pick a contact # small uppercase caption inside the well
externalUrl: https://...  # optional: "Read more" links out, no page built
---
```

Everything sits on one three-column grid (`.grid` in `base.css`): media wells
take a column each (a single well spans all three; with two, the first spans
two), titles sit in column 1, descriptions and case-study prose span columns
2–3. The body is plain MDX. Paragraphs land in columns 2–3 automatically;
media rows span the full width. Two components:

```mdx
import MediaRow from '../../components/MediaRow.astro';
import Shipped from '../../components/Shipped.astro';

<MediaRow items={[{ shape: 'phone', label: 'Pick a contact' }, { src: img, alt: '' }]} />

Prose…

<Shipped items={['Contact picker…', 'Rolled out in 12 countries']} />
```

Placeholder `shape`s: `phone`, `card`, `pill`, `bar`, `tag`, `panel`,
`sheet`, `row`, `none` (label only). To swap one for a real screen, replace
`shape:` with `src:` (import the image in MDX bodies).

The **filename is the URL slug**. The schema is enforced at build time
(`src/content.config.ts`).

### Fun stuff

Same idea, one file per tile in `src/content/fun/`, with a single `media`
object instead of a list and no case-study body.

### `draft: true` hides the page, not the images

A draft's images are still emitted to `dist/_astro/` with a hashed filename,
so they're publicly fetchable even though nothing links to them. For genuinely
confidential work, **keep the images out of the repo**.

## Styling

Every colour, type step and spacing value lives in `src/styles/tokens.css`,
taken from the Figma file ("light editorial v3"). Components reference tokens
only; there is no literal hex anywhere else.

Tokens are two-tier: a **ramp** (`--grey-10`) and a **semantic layer**
(`--ink`, `--surface`, `--rule`) that components actually use. The site is
light-only by design; a dark mode would be a semantic-layer block.

Type is self-hosted (`src/fonts/`, declared in `src/styles/fonts.css`), all
SIL OFL: **Geist** 400/500 (body, titles), **Geist Mono** 400 (labels) and
**Instrument Serif** roman + italic (display headings). Four roles — display,
title, body, label — are documented at the top of the type section in
`tokens.css`; `.title` and `.caps` in `base.css` apply the last two.

`src/styles/base.css` holds element defaults and utilities (`.wrap`, `.caps`,
`.rule`, `.visually-hidden`, `.skip-link`). `src/styles/case.css` is
global on purpose: it styles the case-study article and media rows, which are
fetched into the landing-page sheet and so must be styled on every page.

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
  consts.ts              site name, contact links
  content.config.ts      work + fun schemas
  lib/work.ts            draft filtering + sort order (used everywhere)
  layouts/
    BaseLayout.astro     <head>, meta/OG, header, skip link
    CaseStudyLayout.astro  the <article class="case"> (page + sheet)
  components/
    Nav, SectionHead, ProjectEntry, SmallCard
    Media, MediaRow, Shipped   used in MDX bodies too
    CaseSheet              <dialog> + fetch/history script
  pages/                 index, about, 404, work/[...slug]
  styles/                fonts, tokens, base, case
  fonts/                 woff2
  assets/                portrait
```

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
