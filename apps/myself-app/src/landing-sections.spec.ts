import { describe, expect, it } from 'vitest';

import { LANDING_SECTIONS, sectionPath } from './landing-sections';

describe('the landing sections', () => {
  it('are the four below the hero, in page order', () => {
    expect(LANDING_SECTIONS).toEqual([
      'about',
      'projects',
      'entifix',
      'contact',
    ]);
  });

  it('are anchored from the landing page of each locale', () => {
    expect(sectionPath('en', 'projects')).toBe('/en/#projects');
    expect(sectionPath('es', 'contact')).toBe('/es/#contact');
  });
});
