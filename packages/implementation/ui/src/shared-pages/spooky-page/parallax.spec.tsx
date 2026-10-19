import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SpookyParallax } from './parallax.js';

afterEach(() => {
  vi.unstubAllGlobals();
});

function renderParallax() {
  vi.stubGlobal('CSS', { supports: () => true });
  return render(<SpookyParallax />);
}

describe('the parallax backdrop', () => {
  it('is hidden from assistive technology', () => {
    const { container } = renderParallax();
    expect(
      container.querySelector('.spooky-parallax')?.getAttribute('aria-hidden'),
    ).toBe('true');
  });

  it('holds a far layer and a near one', () => {
    const { container } = renderParallax();
    const layers = [
      ...container.querySelectorAll<HTMLElement>('.spooky-parallax-layer'),
    ];
    expect(layers.map(layer => layer.dataset.depth)).toEqual(['far', 'near']);
    for (const layer of layers) {
      expect(layer.querySelectorAll('.spooky-motif').length).toBeGreaterThan(0);
    }
  });

  it('draws every motif, placed and turned as listed', () => {
    const { container } = renderParallax();
    const motifs = [
      ...container.querySelectorAll<SVGSVGElement>('.spooky-motif'),
    ];
    expect(new Set(motifs.map(motif => motif.dataset.motif))).toEqual(
      new Set([
        'town',
        'tree',
        'door',
        'fenceCat',
        'tomb',
        'dragonfly',
        'swirl',
        'moon',
        'bat',
      ]),
    );
    for (const motif of motifs) {
      expect(motif.style.top).toMatch(/%$/);
      expect(motif.style.width).toMatch(/rem$/);
      expect(motif.style.rotate).toMatch(/deg$/);
      expect(motif.childElementCount).toBeGreaterThan(0);
    }
    expect(motifs.some(motif => motif.style.rotate === '0deg')).toBe(true);
  });
});
