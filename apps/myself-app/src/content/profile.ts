/**
 * The one profile the site is about (#29, #32).
 */
import { Profile } from '@myself-app/domain';

import type { SiteContent } from './site-content';

export async function loadProfile(content: SiteContent): Promise<Profile> {
  const [profile] = await content.loadAll(Profile);
  // `site-content.ts` holds `profile.json` to exactly one record, so a build
  // with none or two never reaches a page.
  return profile as Profile;
}
