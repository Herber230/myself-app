import { describe, expect, it } from 'vitest';

import { loadProfile } from './profile';
import { SITE_REPOSITORIES } from './repositories';

describe('the profile', () => {
  it('is the one shipped record, with its name and title', async () => {
    const profile = await loadProfile(SITE_REPOSITORIES);
    expect(profile.id).toBe('herber-colop');
    expect(`${profile.firstName} ${profile.lastName}`).toBe('Herber Colop');
    expect(profile.title).toEqual({
      en: 'Software Engineer',
      es: 'Ingeniero de software',
    });
  });
});
