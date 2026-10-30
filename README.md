# claracao99.github.io

Clara Cao's personal design portfolio, deployed to GitHub Pages.

**Live:** https://claracao.work/

## Quick start

```sh
npm install
npm run dev          # http://localhost:4321
```

| Command | Does |
| --- | --- |
| `npm run dev` | Dev server with hot reload. |
| `npm run build` | Production build into `dist/`. |
| `npm run preview` | Serve the built site. **Check here before pushing.** |
| `npx astro check` | Type-check `.astro` and `.ts` files. |

Node version is pinned in `.nvmrc` (24). Any Node ≥ 22.12 works locally.

## Structure

- `public/` — the homepage, the static **Close-up** site. Edit it here.
  See [AGENTS.md](./AGENTS.md).
- `src/pages/404.astro` — the 404, the only page Astro builds. GitHub Pages
  serves it for every missing address.
- `scripts/` — `grain-gradient.py`, which generates grainy background textures,
  and `laptop/`, which makes the About laptop's stickers and screen.

## Deployment

Push to `main`. `.github/workflows/deploy.yml` builds and publishes to Pages;
takes about a minute. Pages is set to **Source: GitHub Actions** — if it ever
reverts to branch-based it'll serve the raw repo instead of the built site.

This is a GitHub **user site**, so it serves from the domain root and
`astro.config.mjs` deliberately has **no `base`**. Don't add one — absolute
links then work in dev but 404 in production.

### Custom domain

Served at `claracao.work` (GoDaddy DNS: four `A`/`AAAA` records on `@` to
GitHub's Pages IPs, `www` CNAME to `claracao99.github.io`, plus the
`_github-pages-challenge-claracao99` TXT verifying the domain on the account).
The domain is set in repo Settings → Pages; with the Actions deploy no
`public/CNAME` is needed. `site` in `astro.config.mjs` matches it.

## Constraints

See [AGENTS.md](./AGENTS.md). Short version: this site must outlive any
employer, so no `.npmrc`, no internal packages, no work email in git history,
SSH-only `origin`, and self-hosted fonts only.
