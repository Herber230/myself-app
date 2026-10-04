/**
 * The content the site ships, for the specs that render it. Specs only: the UI
 * never loads content (the app's pages do), and a spec that holds a component
 * to the real content reaches the adapters the app composes (#75).
 */
import { siteContent } from '@myself-app/implementation-adapters/server';

export const SITE_CONTENT = siteContent();

/** The content package's records, with each post's body read from its files. */
export const SITE_RECORDS = SITE_CONTENT.records;

/** The blog as the site reads it outside `next dev`: no drafts. */
export const BLOG_READS = { includeDrafts: false } as const;
