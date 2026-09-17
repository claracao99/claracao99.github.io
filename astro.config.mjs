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
});