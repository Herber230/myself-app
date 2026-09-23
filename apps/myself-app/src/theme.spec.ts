import { describe, expect, it } from 'vitest';

import { DEFAULT_THEME, SITE_THEMES, THEME_STORAGE_KEY } from './theme';

describe('the site themes', () => {
  it('are the three the palettes are declared under', () => {
    expect(SITE_THEMES).toEqual(['blue', 'light', 'dark']);
  });

  it("paint a first visit in the site's own blue", () => {
    expect(DEFAULT_THEME).toBe('blue');
    expect(SITE_THEMES).toContain(DEFAULT_THEME);
  });

  it('name a storage key no other app on the origin would use', () => {
    // Namespaced on purpose: another app on the same origin would otherwise
    // read and write this one's theme.
    expect(THEME_STORAGE_KEY).toBe('myself-app-theme');
    expect(THEME_STORAGE_KEY.startsWith('myself-app-')).toBe(true);
  });
});
