/**
 * How the site reads its blog (ADR 0017): drafts only while `next dev` serves
 * it. The domain's use cases take it as an option.
 */

/** Whether drafts are read: only while `next dev` serves the site. */
export const SHOW_DRAFTS = process.env.NODE_ENV === 'development';

/** The options every blog read takes. */
export const BLOG_READS = { includeDrafts: SHOW_DRAFTS } as const;
