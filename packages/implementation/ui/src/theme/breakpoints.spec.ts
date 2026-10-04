import { describe, expect, it } from 'vitest';

import { NARROW, NOT_NARROW, NOT_WIDE, WIDE } from './breakpoints.js';

describe('the site’s two screen widths', () => {
  it('are a phone below 40rem and a column beside the page from 64rem', () => {
    expect([NARROW, NOT_NARROW]).toEqual([
      '(width < 40rem)',
      '(width >= 40rem)',
    ]);
    expect([WIDE, NOT_WIDE]).toEqual(['(width >= 64rem)', '(width < 64rem)']);
  });
});
