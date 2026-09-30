import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ProjectGlyph } from './project-glyph.js';

const strokesOf = (project: string) => {
  const { container } = render(<ProjectGlyph project={project} />);
  const svg = container.querySelector('svg.project-glyph') as SVGElement;
  expect(svg.getAttribute('aria-hidden')).toBe('true');
  return [...svg.querySelectorAll('path')];
};

describe('a project glyph', () => {
  it.each(['entifix', 'myself-app'])(
    'draws %s in strokes the hover can redraw, one after another',
    project => {
      const strokes = strokesOf(project);
      expect(strokes.length).toBeGreaterThan(3);
      expect(
        strokes.every(path => path.getAttribute('pathLength') === '1'),
      ).toBe(true);
      expect(strokes.at(-1)?.style.getPropertyValue('--stroke-order')).toBe(
        String(strokes.length - 1),
      );
    },
  );

  it('draws a folder for any other project', () => {
    expect(strokesOf('side-project')).toHaveLength(2);
  });
});
