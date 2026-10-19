import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ButtonGlyph, GhostGlyph, HeartGlyph, PumpkinGlyph } from './glyphs.js';

const GLYPHS = [
  ['ghost', GhostGlyph],
  ['pumpkin', PumpkinGlyph],
  ['button', ButtonGlyph],
  ['heart', HeartGlyph],
] as const;

describe('the page’s drawings', () => {
  it.each(GLYPHS)(
    'draws a %s hidden from assistive technology',
    (name, Glyph) => {
      const { container } = render(<Glyph />);
      const svg = container.querySelector('svg');
      expect(svg?.getAttribute('aria-hidden')).toBe('true');
      expect(svg?.getAttribute('class')).toBe(`spooky-${name}`);
    },
  );

  it.each(GLYPHS)('adds a class to the %s when given one', (name, Glyph) => {
    const { container } = render(<Glyph className="extra" />);
    expect(container.querySelector('svg')?.getAttribute('class')).toBe(
      `spooky-${name} extra`,
    );
  });

  it('gives the button its four holes', () => {
    const { container } = render(<ButtonGlyph />);
    expect(container.querySelectorAll('.spooky-button-hole')).toHaveLength(4);
  });
});
