import { getCollection, type CollectionEntry } from 'astro:content';

export type WorkEntry = CollectionEntry<'work'>;
export type FunEntry = CollectionEntry<'fun'>;

/** Drafts are visible in `astro dev` and never reach a production build. */
const published = ({ data }: { data: { draft: boolean } }) =>
  import.meta.env.PROD ? !data.draft : true;

const byOrder = <T extends { data: { order: number; year: number } }>(a: T, b: T) =>
  a.data.order - b.data.order || b.data.year - a.data.year;

/**
 * Every published case study, in display order. Shared by the landing page
 * and the case-study routes so the draft rule and sort order live once.
 */
export async function getPublishedWork(): Promise<WorkEntry[]> {
  return (await getCollection('work', published)).sort(byOrder);
}

/** Case studies that get their own page (i.e. don't link out). */
export async function getCaseStudies(): Promise<WorkEntry[]> {
  return (await getPublishedWork()).filter((e) => !e.data.externalUrl);
}

export async function getPublishedFun(): Promise<FunEntry[]> {
  return (await getCollection('fun', published)).sort(byOrder);
}

export const caseStudyPath = (entry: WorkEntry) => `/work/${entry.id}/`;
