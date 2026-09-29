import {
  type StaticContent,
  targetsOf,
} from '@myself-app/entifix-incubator-static-adapter';

import { Project } from '../../entities/project.entity.js';
import type { Technology } from '../../entities/technology.entity.js';

/** A featured project, with the technologies it is built with. */
export interface FeaturedProject {
  readonly project: Project;
  /** In the order the project lists them. */
  readonly technologies: readonly Technology[];
}

/**
 * The landing page's projects (#30): the featured ones, in their order, with
 * their technologies resolved, so no page reads a link itself (ADR 0018).
 */
export async function loadFeaturedProjects(
  content: StaticContent,
): Promise<FeaturedProject[]> {
  const projects = await content.loadAll(
    Project,
    {
      filtering: [{ property: 'featured', operator: 'eq', value: true }],
      sorting: [{ 0: { property: 'order', type: 'asc' } }],
    },
    { resolve: ['technologies'] },
  );
  return projects.map(project => ({
    project,
    technologies: targetsOf(project.technologies),
  }));
}
