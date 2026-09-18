/**
 * The site's repositories, built once per bundle from the content package.
 *
 * Importing this module is what validates the content: a record that is wrong
 * throws a `ContentValidationError` here, and `next build` stops on it.
 */
import { CONTENT } from '@myself-app/content';

import { buildSiteRepositories } from './site-content';

export const SITE_REPOSITORIES = buildSiteRepositories(CONTENT);
