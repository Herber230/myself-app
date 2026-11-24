import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  KNOTTED_THREAD,
  LOOSE_THREAD,
  MonthSymbols,
  StringLights,
} from './glyphs.js';

describe('the page’s drawings', () => {
  it('declares the ghost, the heart and the conga once, hidden', () => {
    const { container } = render(<MonthSymbols />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(
      [...container.querySelectorAll('symbol')].map(symbol => symbol.id),
    ).toEqual(['month-ghost', 'month-heart', 'month-conga']);
  });

  it('hangs eleven lights on one string, hidden', () => {
    const { container } = render(<StringLights />);
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe(
      'true',
    );
    expect(container.querySelectorAll('circle')).toHaveLength(11);
    expect(container.querySelectorAll('path')).toHaveLength(1);
  });

  it('draws the thread knotted, then loose, between the same ends', () => {
    expect(KNOTTED_THREAD.startsWith('M10 60')).toBe(true);
    expect(LOOSE_THREAD.startsWith('M10 60')).toBe(true);
    expect(KNOTTED_THREAD.endsWith('290 60')).toBe(true);
    expect(LOOSE_THREAD.endsWith('290 60')).toBe(true);
  });
});
