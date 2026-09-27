// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // User site — serves from the domain root, so no `base`. See AGENTS.md.
  site: 'https://claracao99.github.io',
  integrations: [mdx(), sitemap()],
  build: { format: 'directory' },
  // Routes from the previous structure. Work now lives on the landing page and
  // contact details on /about, so old links and search results still land.
  redirects: {
    '/work/': '/',
    '/contact/': '/about/',
  },
});
