import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import type { SchemaContext } from 'astro:content';

/**
 * One visual in a media row. Either a real image (`src`) or, until the export
 * exists, a placeholder `shape` sized like the design. `label` is the small
 * uppercase caption inside the well; omit it once the image speaks for itself.
 * A `video` (a path under public/, e.g. /media/search-bar.mp4) plays muted on
 * a loop, with `src` as its poster: required alongside it, because the poster
 * is what reduced-motion visitors see.
 */
const mediaItem = ({ image }: SchemaContext) =>
  z.object({
    src: image().optional(),
    video: z.string().startsWith('/').optional(),
    /** Empty string is valid and correct for purely decorative images. */
    alt: z.string().default(''),
    label: z.string().optional(),
    shape: z
      .enum(['phone', 'card', 'pill', 'bar', 'tag', 'panel', 'sheet', 'row', 'none'])
      .default('none'),
  })
    .refine((m) => !m.video || m.src, { message: 'a video needs `src` as its poster' });

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
 * Selected works. Each entry is a card on the index plus, for case studies, a
 * page of its own. Adding one means dropping an .mdx file into
 * src/content/work/. The filename is the slug, so there's no `slug` field to
 * drift out of sync.
 */
const work = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/work' }),
  schema: (ctx) =>
    z.object({
      ...common,
      /** e.g. "Bolt". Shown with the year in the case-study caption. */
      client: z.string().optional(),
      /** The index card's visual: a cover photo, or a video with its poster. */
      cover: mediaItem(ctx),
      /** Index card size. Case studies are wide with the cover photo full
       * bleed; visual pieces are portrait, video on Figure grey. */
      card: z.enum(['wide', 'portrait']).default('wide'),
      /** Video cards only: where the phone sits at rest (`start`) and while
       * playing (`end`). Phone left, top and width in px on the Figma board
       * "Device tile · phone positions" (549:1867), whose cards are
       * 347.5×434.375, a portrait card at 1440. Scaled to any card size. */
      stage: z
        .object({
          start: z.object({ x: z.number(), y: z.number(), w: z.number() }),
          end: z.object({ x: z.number(), y: z.number(), w: z.number() }),
        })
        .optional(),
      /** False for visual pieces: no page is built and the card isn't a link. */
      caseStudy: z.boolean().default(true),
      /** The case page's panels, down the left column. Falls back to the
       * cover when empty. */
      media: z.array(mediaItem(ctx)).default([]),
      /** If set, the card links out here and no case-study page is built. */
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
