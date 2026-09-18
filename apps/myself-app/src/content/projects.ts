/**
 * The landing page's projects (#30): the featured ones, in their order, read
 * through the `load` use case like every other page read (ADR 0003, path A).
 */
import { Project } from '@myself-app/domain';

import { loadEvery } from './queries';
import type { SiteRepositories } from './site-content';

export function loadFeaturedProjects(
  repositories: SiteRepositories,
): Promise<Project[]> {
  return loadEvery(repositories, Project, {
    filtering: [{ property: 'featured', operator: 'eq', value: true }],
    sorting: [{ 0: { property: 'order', type: 'asc' } }],
  });
}
