import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ProjectCard } from './project-card.js';

describe('a project card', () => {
  it('is one link named after the project, with its glyph and summary', () => {
    const { container } = render(
      <ProjectCard
        id="entifix"
        name="entifix"
        summary="An entity framework."
        href="/en/projects/entifix/"
        cue="How it works"
      />,
    );
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(links[0]?.getAttribute('href')).toBe('/en/projects/entifix/');
    expect(
      screen.getByRole('heading', { level: 3, name: 'entifix' }),
    ).toBeTruthy();
    expect(screen.getByText('An entity framework.')).toBeTruthy();
    expect(container.querySelector('svg.project-glyph')).toBeTruthy();
  });
});
