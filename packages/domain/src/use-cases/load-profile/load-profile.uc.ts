import type { StaticContent } from '@myself-app/entifix-incubator-static-adapter';

import { Profile } from '../../entities/profile.entity.js';

/** The one profile the site is about (#29, #32). */
export async function loadProfile(content: StaticContent): Promise<Profile> {
  const [profile] = await content.loadAll(Profile);
  // The profile's source holds `profile.json` to exactly one record, so a
  // build with none or two never reaches a page.
  return profile as Profile;
}
