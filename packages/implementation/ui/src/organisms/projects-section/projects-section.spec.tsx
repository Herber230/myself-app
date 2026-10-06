import { loadFeaturedProjects } from '@myself-app/domain/use-cases';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SITE_CONTENT } from '../../test/shipped-content.js';
import { ProjectsSection } from './projects-section.js';

describe('the projects section', () => {
  it('shows the featured projects in their order, entifix first', async () => {
    const projects = await loadFeaturedProjects(SITE_CONTENT);
    render(<ProjectsSection locale="en" projects={projects} />);
    expect(
      screen
        .getAllByRole('heading', { level: 3 })
        .map(heading => heading.textContent),
    ).toEqual(['entifix', 'r10c', 'myself-app']);
  });

  it('leads each card to its project’s page, in the reader’s language', async () => {
    const projects = await loadFeaturedProjects(SITE_CONTENT);
    render(<ProjectsSection locale="es" projects={projects} />);
    expect(
      screen.getAllByRole('link').map(link => link.getAttribute('href')),
    ).toEqual([
      '/es/projects/entifix/',
      '/es/projects/r10c/',
      '/es/projects/myself-app/',
    ]);
    const [entifix] = screen.getAllByRole('article');
    expect(
      [...(entifix?.querySelectorAll('.link-card-tags li') ?? [])].map(
        item => item.textContent,
      ),
    ).toEqual(projects[0]?.technologies.map(technology => technology.name?.es));
    expect(
      screen.getByText(projects[0]?.project.summary?.es as string),
    ).toBeTruthy();
  });
});
