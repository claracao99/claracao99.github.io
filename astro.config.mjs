// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
// The homepage is static files in public/; Astro builds only the 404.
export default defineConfig({
  // User site — serves from the domain root, so no `base`. See AGENTS.md.
  site: 'https://claracao.work',
  build: { format: 'directory' },
});
