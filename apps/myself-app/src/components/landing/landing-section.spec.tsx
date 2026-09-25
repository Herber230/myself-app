import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { LandingSection } from './landing-section';

describe('a landing section', () => {
  it('is an anchor, named by its heading from the catalog', () => {
    render(
      <LandingSection id="projects" locale="es">
        <p>body</p>
      </LandingSection>,
    );
    const section = screen.getByRole('region', { name: 'Proyectos' });
    expect(section.id).toBe('projects');
    expect(section.textContent).toContain('body');
  });
});
