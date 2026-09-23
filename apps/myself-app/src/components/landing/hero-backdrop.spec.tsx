import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { HeroBackdrop } from './hero-backdrop';

describe('the hero backdrop', () => {
  it('is decorative: glyphs hidden from assistive technology', () => {
    const { container } = render(<HeroBackdrop />);
    const backdrop = container.firstElementChild as HTMLElement;
    expect(backdrop.getAttribute('aria-hidden')).toBe('true');
    const glyphs = backdrop.querySelectorAll('svg.hero-glyph');
    expect(glyphs.length).toBe(12);
    for (const glyph of glyphs) {
      expect(glyph.querySelector('path')?.getAttribute('d')).toBeTruthy();
      expect((glyph as SVGElement).style.animationDuration).toMatch(/s$/);
    }
  });
});
