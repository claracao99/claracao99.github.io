# claracao99.github.io

Clara Cao's personal design portfolio. Astro static site, deployed to GitHub
Pages.

**Live:** https://claracao.work/

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

- `/` — landing page: header and **Selected works** (one block per case study).
  "Read more" links to the case study page.
- `/work/<slug>/` — a case study, after yuriroga.com/work/*: the name in a
  pill that leads back, and an Information/Description card on the left; the cover and the
  entry's `media` as tiles on the right.

`/work/` and `/contact/` from the previous structure redirect (see
`astro.config.mjs`).

## Adding a case study

Drop one `.mdx` file into `src/content/work/`. No code changes.

```yaml
---
title: Order for someone else
summary: One or two sentences. Landing description and meta description.
company: Bolt             # optional; Information → Company on the case page
date: Jun 2026            # display label, free text
year: 2026                # sort tiebreaker
order: 1                  # lower sorts first
draft: true               # visible in dev, excluded from the built site
media:                    # case page tiles after the cover; omit for placeholders, [] for none
  - src: ./hero.png       # co-located image, optimised by astro:assets
    alt: ''               # '' is correct for decorative images
    size: large           # at its own ratio; default small (square)
  - shape: phone          # …or a placeholder tile until the export exists
    label: Pick a contact # small uppercase caption inside the tile
externalUrl: https://...  # optional: "Read more" links out, no page built
phone: false              # a cover video full bleed (a motion cover) rather than in the phone
film:                     # optional: the page opens on this film at 16:9, with sound and controls
  video: /media/walkthrough.mp4   # under public/; re-encode first (H.264, +faststart)
  poster: ./poster.jpg
  rate: 1.25              # starting speed (default 1.25)
transcript:               # film pages: a Transcript section; each time seeks the film
  - at: '0:07'
    title: Intro          # quote it if it has a colon
    text: Hi, I'm Clara…
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

### `draft: true` hides the page, not the images

A draft's images are still emitted to `dist/_astro/` with a hashed filename,
so they're publicly fetchable even though nothing links to them. For genuinely
confidential work, **keep the images out of the repo**.

## Styling

Every colour, type step and spacing value lives in `src/styles/tokens.css`,
a pure-neutral palette on white (originally the Figma's tinted greys). Components reference tokens
only; there is no literal hex anywhere else.

Tokens are two-tier: a **ramp** (`--grey-10`) and a **semantic layer**
(`--ink`, `--surface`, `--rule`) that components actually use. Dark mode
overrides the ramp under `:root[data-theme='dark']`; the lamp in the corner
(`Lamp.astro`) is its only switch, and the site opens light.

Type is self-hosted (`src/fonts/`, declared in `src/styles/fonts.css`):
**ABC Diatype** 400/700 (body, titles), **ABC Diatype Mono** 400 (labels) —
both currently the Dinamo *trial* files, see TODO — and **Instrument Serif**
roman + italic (display headings, SIL OFL). The roles (display, case title,
title, body, label) and the three link treatments are documented at the top of
the type section in `tokens.css`; `.title` and `.caps` in `base.css` apply
title and label.

`src/styles/base.css` holds element defaults and utilities (`.wrap`, `.caps`,
`.rule`, `.visually-hidden`, `.skip-link`). `src/styles/case.css` is
global on purpose: it styles the case-study page and media rows, which MDX
bodies emit without any component scope.

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
  content.config.ts      work schema
  lib/work.ts            draft filtering + sort order (used everywhere)
  layouts/
    BaseLayout.astro     <head>, meta/OG, header, footer
    CaseStudyLayout.astro  the two-column case-study page
  components/
    Nav, Footer, SectionHead, ProjectEntry
    Media, MediaRow, Shipped   used in MDX bodies too
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

### Custom domain

Served at `claracao.work` (GoDaddy DNS: four `A`/`AAAA` records on `@` to
GitHub's Pages IPs, `www` CNAME to `claracao99.github.io`, plus the
`_github-pages-challenge-claracao99` TXT verifying the domain on the account).
The domain is set in repo Settings → Pages; with the Actions deploy no
`public/CNAME` is needed. `site` in `astro.config.mjs` matches it so canonical
URLs and the sitemap follow.

## Constraints

See [AGENTS.md](./AGENTS.md). Short version: this site must outlive any
employer, so no `.npmrc`, no internal packages, no work email in git history,
SSH-only `origin`, and self-hosted fonts only.
