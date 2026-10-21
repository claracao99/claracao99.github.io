// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // User site — serves from the domain root, so no `base`. See AGENTS.md.
  site: 'https://claracao.work',
  integrations: [mdx(), sitemap()],
  build: { format: 'directory' },
  // Off: during the theme switch the glass pills' own layers paint over it,
  // and its bar sits in a shadow root the site's CSS can't lift.
  devToolbar: { enabled: false },
  // Routes from the previous structure. Work now lives on the landing page, so
  // old links still land.
  redirects: {
    '/work/': '/',
  },
});
