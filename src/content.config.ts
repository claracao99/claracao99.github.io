import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Case studies.
 *
 * Adding a project means dropping one .mdx file into src/content/work/ with
 * the frontmatter below and a co-located cover image. No code changes.
 * The filename is the slug, so there's no `slug` field to drift out of sync.
 */
const work = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/work' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      /** One or two sentences, shown on the work index and in meta tags. */
      summary: z.string().max(240),
      /** e.g. "Product design, prototyping" */
      role: z.string(),
      client: z.string().optional(),
      year: z.coerce.number().int(),
      /** Relative path to an image file — processed by astro:assets. */
      cover: image(),
      /** Empty string is valid and correct for purely decorative covers. */
      coverAlt: z.string(),
      tags: z.array(z.string()).default([]),
      /** Lower sorts first on the work index; ties break by year, descending. */
      order: z.number().default(999),
      /** Visible in `astro dev`, excluded from production builds. */
      draft: z.boolean().default(false),
      /** If set, the index links out here instead of to a case-study page. */
      externalUrl: z.url().optional(),
    }),
});

export const collections = { work };
