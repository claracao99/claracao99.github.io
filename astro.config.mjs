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
  // Routes from the previous structure. Work now lives on the landing page, so
  // old links still land.
  redirects: {
    '/work/': '/',
  },
});
