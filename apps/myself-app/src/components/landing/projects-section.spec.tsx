import type { Project } from '@myself-app/domain';
import { targetsOf } from '@myself-app/entifix-incubator-static-adapter';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { loadFeaturedProjects } from '../../content/projects';
import { SITE_CONTENT } from '../../content/repositories';
import { ProjectsSection } from './projects-section';

describe('the projects section', () => {
  it('shows the featured projects from content, in their order', async () => {
    const projects = await loadFeaturedProjects(SITE_CONTENT);
    render(<ProjectsSection locale="en" projects={projects} />);
    expect(
      screen
        .getAllByRole('heading', { level: 3 })
        .map(heading => heading.textContent),
    ).toEqual(projects.map(project => project.name));
    // Each card is an anchor a technology's page links to (#42).
    expect(document.getElementById('project-myself-app')).not.toBeNull();
  });

  it('links each technology to its place on the radar, by its name', async () => {
    const [project] = (await loadFeaturedProjects(SITE_CONTENT)) as [Project];
    render(<ProjectsSection locale="es" projects={[project]} />);
    const list = screen.getByRole('list', {
      name: `Tecnologías de ${String(project.name)}`,
    });
    const links = within(list).getAllByRole('link');
    const technologies = targetsOf(project.technologies);
    expect(links.map(link => link.getAttribute('href'))).toEqual(
      technologies.map(each => `/es/tech-radar/#tech-${String(each.id)}`),
    );
    expect(links.map(link => link.textContent)).toEqual(
      technologies.map(each => each.name?.es),
    );
  });

  it('links the site and the source only where a project has them', async () => {
    const project = (fields: Record<string, unknown>) =>
      ({
        summary: { en: 'Summary', es: 'Resumen' },
        technologies: { ids: [], values: [] },
        ...fields,
      }) as unknown as Project;
    render(
      <ProjectsSection
        locale="en"
        projects={[
          project({
            id: 'a',
            name: 'A',
            url: 'https://a.example',
            repositoryUrl: 'https://github.com/a',
          }),
          project({ id: 'b', name: 'B' }),
        ]}
      />,
    );
    const [a, b] = screen.getAllByRole('listitem').map(item => within(item));
    const site = a?.getByRole('link', { name: 'Visit the site' });
    expect(site?.getAttribute('href')).toBe('https://a.example');
    expect(site?.getAttribute('rel')).toBe('noopener noreferrer');
    expect(
      a?.getByRole('link', { name: 'Read the source' }).getAttribute('href'),
    ).toBe('https://github.com/a');
    expect(b?.queryAllByRole('link')).toEqual([]);
  });
});
