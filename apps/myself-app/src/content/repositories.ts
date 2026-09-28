/**
 * The site's repositories, built once per bundle from the content package.
 *
 * Importing this module is what validates the content: a record that is wrong
 * throws a `ContentValidationError` here, and `next build` stops on it. So does
 * placeholder text not listed in `pending-content.ts` (#26).
 */
import { CONTENT } from '@myself-app/content';

import { assertNoUnlistedPlaceholders } from './placeholders';
import { withPostBodies } from './post-bodies';
import { buildSiteRepositories } from './site-content';

/** The content package's records, with each post's body read from its files. */
export const SITE_CONTENT = withPostBodies(CONTENT);

assertNoUnlistedPlaceholders(SITE_CONTENT);

export const SITE_REPOSITORIES = buildSiteRepositories(SITE_CONTENT);
