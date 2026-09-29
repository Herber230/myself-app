/**
 * How the site reads its blog (ADR 0017): drafts only while `next dev` serves
 * it, and a preview's excerpt read from the body's Markdown by the site's own
 * renderer. The domain's use cases take both as options.
 */
import { excerptOf } from '../blog/markdown/excerpt';

/** Whether drafts are read: only while `next dev` serves the site. */
export const SHOW_DRAFTS = process.env.NODE_ENV === 'development';

/** The options every blog read takes. */
export const BLOG_READS = { includeDrafts: SHOW_DRAFTS } as const;

/** The options every preview takes: the reads', and the excerpt reader. */
export const BLOG_PREVIEWS = { ...BLOG_READS, excerptOf } as const;
