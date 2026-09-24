import { describe, expect, it } from 'vitest';

import { cvPath } from './cv-paths';

describe('a CV path', () => {
  it('is /cv for the default variant, and /cv/<variant> for another', () => {
    expect(cvPath('full-stack', 'human', 'full-stack')).toBe('/cv');
    expect(cvPath('backend', 'human', 'full-stack')).toBe('/cv/backend');
  });

  it('ends in ats for the ATS mode', () => {
    expect(cvPath('full-stack', 'ats', 'full-stack')).toBe('/cv/ats');
    expect(cvPath('devops', 'ats', 'full-stack')).toBe('/cv/devops/ats');
  });
});
