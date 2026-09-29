import { CONTENT } from '@myself-app/content';
import type { StaticContent } from '@myself-app/entifix-incubator-static-adapter';

import { assertNoUnlistedPlaceholders } from './placeholders.js';
import { buildSiteContent } from './site-content.js';

/**
 * The site's content, built from the content package and validated: a record
 * that is wrong throws a `ContentValidationError`, and so does placeholder
 * text not listed in `pending-content.ts` (#26). The app builds it once per
 * bundle, in its composition root, so `next build` stops on either.
 */
export function siteContent(): StaticContent {
  const content = buildSiteContent(CONTENT);
  assertNoUnlistedPlaceholders(content.records);
  return content;
}
