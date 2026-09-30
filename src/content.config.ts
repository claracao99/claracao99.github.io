import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import type { SchemaContext } from 'astro:content';

/**
 * One visual in a media row. Either a real image (`src`) or, until the export
 * exists, a placeholder `shape` sized like the design. `label` is the small
 * uppercase caption inside the well; omit it once the image speaks for itself.
 */
const mediaItem = ({ image }: SchemaContext) =>
  z.object({
    src: image().optional(),
    /** Empty string is valid and correct for purely decorative images. */
    alt: z.string().default(''),
    label: z.string().optional(),
    shape: z
      .enum(['phone', 'card', 'pill', 'bar', 'tag', 'panel', 'sheet', 'row', 'none'])
      .default('none'),
  });

const common = {
  title: z.string(),
  /** One or two sentences. Landing description and meta description. */
  summary: z.string().max(300),
  /** Display label, e.g. "Jun 2026". Free text so it can read naturally. */
  date: z.string(),
  /** Sort key. Lower sorts first; ties break by `year`, descending. */
  order: z.number().default(999),
  year: z.coerce.number().int(),
  /** Visible in `astro dev`, excluded from production builds. */
  draft: z.boolean().default(false),
};

/**
 * Selected works. Each entry is a landing-page block plus a case study body.
 * Adding one means dropping an .mdx file into src/content/work/. The filename
 * is the slug, so there's no `slug` field to drift out of sync.
 */
const work = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/work' }),
  schema: (ctx) =>
    z.object({
      ...common,
      /** e.g. "Bolt". Shown with the year in the case-study caption. */
      client: z.string().optional(),
      /** Landing page shows the first three; the case page shows them all,
       * as full-height panels down the left column. */
      media: z.array(mediaItem(ctx)).min(1),
      /** If set, "Read more" links out here and no case-study page is built. */
      externalUrl: z.url().optional(),
    }),
});

/**
 * Fun stuff. Small grid at the bottom of the landing page; no detail page.
 */
const fun = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/fun' }),
  schema: (ctx) =>
    z.object({
      ...common,
      media: mediaItem(ctx),
      externalUrl: z.url().optional(),
    }),
});

export const collections = { work, fun };
