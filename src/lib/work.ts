import { getCollection, type CollectionEntry } from 'astro:content';

export type WorkEntry = CollectionEntry<'work'>;

/**
 * Every published case study, in display order.
 *
 * Drafts are visible while running `astro dev` but never reach a production
 * build — so an unfinished case study can sit in the repo safely.
 *
 * Shared by the work index, the case-study routes and the landing page so the
 * draft rule and sort order are defined exactly once.
 */
export async function getPublishedWork(): Promise<WorkEntry[]> {
  const entries = await getCollection('work', ({ data }) =>
    import.meta.env.PROD ? !data.draft : true,
  );

  return entries.sort(
    (a, b) => a.data.order - b.data.order || b.data.year - a.data.year,
  );
}
