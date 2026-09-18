import { describe, expect, it } from 'vitest';

import { SITE_THEMES, THEME_STORAGE_KEY } from './theme';

describe('the site themes', () => {
  it('are the two the palettes are declared under', () => {
    expect(SITE_THEMES).toEqual(['light', 'dark']);
  });

  it('name a storage key no other app on the origin would use', () => {
    // Namespaced on purpose: another app on the same origin would otherwise
    // read and write this one's theme.
    expect(THEME_STORAGE_KEY).toBe('myself-app-theme');
    expect(THEME_STORAGE_KEY.startsWith('myself-app-')).toBe(true);
  });
});
