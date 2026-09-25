import { Project, Technology } from '@myself-app/domain';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { loadFeaturedProjects } from '../../content/projects';
import { loadEvery } from '../../content/queries';
import { SITE_REPOSITORIES } from '../../content/repositories';
import { ProjectsSection } from './projects-section';

async function technologiesById() {
  const technologies = await loadEvery(SITE_REPOSITORIES, Technology);
  return new Map(technologies.map(each => [String(each.id), each]));
}

describe('the projects section', () => {
  it('shows the featured projects from content, in their order', async () => {
    const projects = await loadFeaturedProjects(SITE_REPOSITORIES);
    render(
      <ProjectsSection
        locale="en"
        projects={projects}
        technologies={await technologiesById()}
      />,
    );
    expect(
      screen
        .getAllByRole('heading', { level: 3 })
        .map(heading => heading.textContent),
    ).toEqual(projects.map(project => project.name));
    // Each card is an anchor a technology's page links to (#42).
    expect(document.getElementById('project-myself-app')).not.toBeNull();
  });

  it('links each technology to its place on the radar, by its name', async () => {
    const [project] = await loadFeaturedProjects(SITE_REPOSITORIES);
    const technologies = await technologiesById();
    render(
      <ProjectsSection
        locale="es"
        projects={[project as Project]}
        technologies={technologies}
      />,
    );
    const list = screen.getByRole('list', {
      name: `Tecnologías de ${String(project?.name)}`,
    });
    const links = within(list).getAllByRole('link');
    const ids = project?.technologies.ids.map(String);
    expect(links.map(link => link.getAttribute('href'))).toEqual(
      ids?.map(id => `/es/tech-radar/#tech-${id}`),
    );
    expect(links.map(link => link.textContent)).toEqual(
      ids?.map(id => technologies.get(id)?.name?.es),
    );
  });

  it('links the site and the source only where a project has them', async () => {
    const project = (fields: Record<string, unknown>) =>
      ({
        summary: { en: 'Summary', es: 'Resumen' },
        technologies: { ids: [] },
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
        technologies={await technologiesById()}
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
