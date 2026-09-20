# Open items

State as of 2026-09-20. The site is live and the plumbing is done; what's left
is mostly content and design direction.

## Needs a decision from Clara

- [ ] **Landing page art direction.** `src/pages/index.astro` is deliberately
      restrained — a correct, accessible, responsive structure rather than a
      finished design. It consumes tokens only, so a visual direction can be
      applied without restructuring the markup. This is the one page that
      shouldn't read as a template default.
- [ ] **Palette.** `src/styles/tokens.css` ships a neutral ramp with a green
      accent as a placeholder, plus a dark mode. Decide whether the site is
      light, dark, or both. Contrast ratios for the ramp are documented in
      comments at the top of the file.
- [ ] **Type.** Currently a system stack. If a display face is wanted, it must
      be self-hosted woff2 in `src/fonts/` — no CDN, no employer-licensed
      typeface.

## Placeholder copy that is currently public

All marked `TODO (Clara)` in the source.

- [ ] `src/consts.ts` — `SITE.title` and `SITE.description`. These feed
      `<title>`, OG tags and search results, so they're the most visible
      placeholder text on the site.
- [ ] `src/pages/index.astro` — hero headline and lede.
- [ ] `src/pages/about.astro` — entire body.
- [ ] `src/pages/contact.astro` — the `links` array still points at
      `hello@example.com` and a generic LinkedIn URL.

## Content

- [ ] **Real case studies.** This is the actual bottleneck — the site took a
      few hours; the portfolio doesn't exist until the projects do.
      `src/content/work/example-project-{one,two}.mdx` are worked examples
      (both `draft: true`); copy one to start. See README for the frontmatter.
- [ ] Delete the two example entries once real work replaces them.
- [ ] Replace `public/favicon.svg` (still the Astro default).
- [ ] Add an OG share image. `BaseLayout` already supports one via the
      `ogImage` prop; nothing sets it yet, so link previews are text-only.

## Nice to have

- [ ] Custom domain — see README. One CNAME file plus DNS.
- [ ] A real 404 illustration or something with more personality.
- [ ] Reduced-motion is handled globally, but re-check any bespoke animation
      added later.

## Verified working (don't re-litigate)

- Deploy: push to `main` → live in ~1 minute.
- Responsive: zero horizontal overflow across 7 viewports × 6 pages.
- Tap targets: ≥ 44px everywhere except inline prose links (correct).
- Dark mode reassigns only the semantic token layer.
- Durability audit clean: no work email in history, no `.npmrc`, no internal
  packages, SSH-only remote.
