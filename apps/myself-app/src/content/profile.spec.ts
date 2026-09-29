import { loadProfile } from '@myself-app/domain/use-cases';
import { describe, expect, it } from 'vitest';

import { SITE_CONTENT } from './repositories';

describe('the profile', () => {
  it('is the one shipped record, with its name and title', async () => {
    const profile = await loadProfile(SITE_CONTENT);
    expect(profile.id).toBe('herber-colop');
    expect(`${profile.firstName} ${profile.lastName}`).toBe('Herber Colop');
    expect(profile.title).toEqual({
      en: 'Software Engineer',
      es: 'Ingeniero de software',
    });
  });
});
