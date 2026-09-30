import {
  type StaticContent,
  targetsOf,
} from '@myself-app/entifix-incubator-static-adapter';

import { ArchitectureDecision } from '../../entities/architecture-decision.entity.js';
import { Project } from '../../entities/project.entity.js';
import { ProjectPath } from '../../entities/project-path.entity.js';
import { ProjectPattern } from '../../entities/project-pattern.entity.js';
import type { ProjectPage } from './load-project-page.types.js';

const FEATURED = {
  property: 'featured',
  operator: 'eq',
  value: true,
} as const;

/** The projects with a page of their own: the featured ones, in order. */
export async function loadProjectIds(
  content: StaticContent,
): Promise<string[]> {
  const projects = await content.loadAll(Project, {
    filtering: [FEATURED],
    sorting: [{ 0: { property: 'order', type: 'asc' } }],
  });
  return projects.map(project => String(project.id));
}

/**
 * A featured project's page (#77): the project and its technologies, its
 * patterns and file tree in their order, and its decision records by number.
 * Nothing for an id that names no featured project.
 */
export async function loadProjectPage(
  content: StaticContent,
  id: string,
): Promise<ProjectPage | undefined> {
  const ofProject = { property: 'project', operator: 'eq', value: id } as const;
  const byOrder = [{ 0: { property: 'order', type: 'asc' } }] as const;
  const [[project], patterns, paths, decisions] = await Promise.all([
    content.loadAll(
      Project,
      {
        filtering: [FEATURED, { property: 'id', operator: 'eq', value: id }],
      },
      { resolve: ['technologies'] },
    ),
    content.loadAll(ProjectPattern, {
      filtering: [ofProject],
      sorting: [...byOrder],
    }),
    content.loadAll(ProjectPath, {
      filtering: [ofProject],
      sorting: [...byOrder],
    }),
    content.loadAll(ArchitectureDecision, {
      filtering: [ofProject],
      sorting: [{ 0: { property: 'number', type: 'asc' } }],
    }),
  ]);
  if (project === undefined) return undefined;
  return {
    project,
    technologies: targetsOf(project.technologies),
    patterns,
    paths,
    decisions,
  };
}
