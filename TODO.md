# Open items

State as of 2026-10-01. Landing + about + full-screen two-column case pages
are implemented with the Figma's placeholder copy and grey media wells.

## Before sharing the site

- [ ] **Font licence.** `src/fonts/ABCDiatypeTrial-*.woff2` are Dinamo trial
      files, licensed for testing only — not for a published site. Buy a web
      licence for ABC Diatype Regular + Medium and swap the files (same names,
      or update `src/styles/fonts.css`). Until then, treat the live site as a
      preview. Fallback if not buying: revert to Inter (git history has the Inter setup, OFL).

## Content — the actual bottleneck

- [ ] **Media.** Every well is a placeholder `shape`. Replace with real exports:
      swap `shape:` for `src: ./file.png` in the frontmatter / MDX. Cap masters
      at ~2500px on the long edge.
- [ ] **Case-study bodies** for Rider prototype library, Activity – London and
      Cash payment flows are marked `TODO (Clara)` in the MDX — only Order for
      someone else has real prose.
- [ ] `src/pages/about.astro` — bio still says "[Company] and [Company]".
- [ ] `src/consts.ts` — confirm the LinkedIn URL; drop a CV at `public/cv.pdf`
      (the About page already links to it, so it 404s until then).
- [ ] Experience links point at company homepages — change or remove.
- [ ] Replace `public/favicon.svg` (still the Astro default).
- [ ] OG share image. `BaseLayout` supports one via `ogImage`; nothing sets it.

## Design follow-ups

- [ ] The Figma has no phone layouts. The implementation stacks media rows
      and columns below 48rem/64rem — review on a real phone.

## Nice to have

- [ ] Custom domain — see README. One CNAME file plus DNS.

## Verified working (don't re-litigate)

- Deploy: push to `main` → live in ~1 minute.
- Redirects: `/work/` → `/`, `/contact/` → `/about/`.
- Durability audit: no work email in history, no `.npmrc`, no internal
  packages, SSH-only remote, fonts self-hosted.
