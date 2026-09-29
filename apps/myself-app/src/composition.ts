/**
 * The composition root (ADR 0018, #75): the one place the site's content is
 * built, once per bundle, from `@myself-app/implementation-adapters`.
 *
 * Importing this module is what validates the content: a record that is wrong
 * throws a `ContentValidationError` here, and `next build` stops on it. So does
 * placeholder text not listed in the adapters' `pending-content.ts` (#26).
 */
import { siteContent } from '@myself-app/implementation-adapters/server';

export const SITE_CONTENT = siteContent();

/** The content package's records, with each post's body read from its files. */
export const SITE_RECORDS = SITE_CONTENT.records;
