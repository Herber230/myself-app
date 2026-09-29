import { describe, expect, it } from 'vitest';

import { fixtureContent } from '../content.fixture.js';
import { loadProfile } from './load-profile.uc.js';

describe('the profile', () => {
  it('is the one record the site is about', async () => {
    const profile = await loadProfile(fixtureContent());
    expect(profile.id).toBe('ada');
    expect(profile.title).toEqual({ en: 'Engineer', es: 'Engineer (es)' });
  });
});
