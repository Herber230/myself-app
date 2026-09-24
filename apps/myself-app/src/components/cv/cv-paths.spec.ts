import { describe, expect, it } from 'vitest';

import { cvPath, cvPdfName } from './cv-paths';

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

describe("a CV's PDF", () => {
  it('names the variant, the locale and, for an ATS, the mode', () => {
    expect(cvPdfName('full-stack', 'en', 'human')).toBe(
      'herber-colop-cv-full-stack-en.pdf',
    );
    expect(cvPdfName('backend', 'es', 'ats')).toBe(
      'herber-colop-cv-backend-es-ats.pdf',
    );
  });
});
