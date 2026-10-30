# Open items

State as of 2026-10-30.

- [ ] **GitHub Support purge.** The CV was removed from the repo's history and
      force-pushed, but GitHub still serves the orphaned commit by SHA
      (`13cc9c2f4a9d90bdd908a5aacaf646b81a79e041`, `public/cv.pdf`). Ask
      support.github.com/contact to remove the cached views.
- [ ] **ABC Diatype web licence.** The site shows Diatype only where it is
      installed locally; everyone else gets Inter. Buy the web licence to ship
      it, or keep Inter.
- [ ] **Play deep link (optional).** The 404's Play tab goes to `/#work`,
      because the homepage has no `#play` route. Add one in
      `public/closeup.js` if Play should open directly.

## Verified working (don't re-litigate)

- Deploy: push to `main` → live in ~1 minute.
- Missing addresses (incl. the old `/work/…` pages and `/cv.pdf`) return the
  404 page with a 404 status.
- Durability audit: no work email in history, no `.npmrc`, no internal
  packages, SSH-only remote, fonts self-hosted.
