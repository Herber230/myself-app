/**
 * The one profile the site is about (#29, #32).
 */
import { Profile } from '@myself-app/domain';

import { loadEvery } from './queries';
import type { SiteRepositories } from './site-content';

export async function loadProfile(
  repositories: SiteRepositories,
): Promise<Profile> {
  const [profile] = await loadEvery(repositories, Profile);
  // `site-content.ts` holds `profile.json` to exactly one record, so a build
  // with none or two never reaches a page.
  return profile as Profile;
}
