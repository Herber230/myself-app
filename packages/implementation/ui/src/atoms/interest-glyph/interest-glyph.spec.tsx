import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { InterestGlyph } from './interest-glyph.js';

const strokesOf = (interest: string) =>
  [
    ...render(<InterestGlyph interest={interest} />).container.querySelectorAll(
      'path',
    ),
  ].map(path => path.getAttribute('d'));

describe("an interest's glyph", () => {
  it('is decorative, drawn in strokes the hover can redraw in order', () => {
    const { container } = render(<InterestGlyph interest="salsa" />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(svg?.getAttribute('class')).toBe('interest-glyph');
    const paths = [...container.querySelectorAll('path')];
    expect(paths.map(path => path.getAttribute('pathLength'))).toEqual(
      paths.map(() => '1'),
    );
    expect(
      paths.map(path => path.style.getPropertyValue('--stroke-order')),
    ).toEqual(paths.map((_, index) => String(index)));
  });

  it('is drawn for each interest the site has, and a heart for any other', () => {
    const drawings = ['motorcycles', 'reading', 'salsa', 'chess', 'go'].map(
      interest => strokesOf(interest).join(' '),
    );
    expect(new Set(drawings.slice(0, 3)).size).toBe(3);
    expect(drawings[3]).toBe(drawings[4]);
    expect(drawings.slice(0, 3)).not.toContain(drawings[3]);
  });

  it('takes its class from the caller', () => {
    const { container } = render(
      <InterestGlyph interest="reading" className="teaser-glyph" />,
    );
    expect(container.querySelector('svg')?.getAttribute('class')).toBe(
      'teaser-glyph',
    );
  });
});
