import { siteContent } from './site.js';

/**
 * The content the site ships, built once for the specs that hold it to what
 * the pages need. Not a fixture in the sense of invented data: the real thing.
 */
export const SITE_CONTENT = siteContent();

/** The content package's records, with each post's body read from its files. */
export const SITE_RECORDS = SITE_CONTENT.records;
