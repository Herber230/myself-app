import {
  type StaticContent,
  targetOf,
  targetsOf,
} from '@myself-app/entifix-incubator-static-adapter';

import { Project } from '../../entities/project.entity.js';
import { Technology } from '../../entities/technology.entity.js';
import { TechnologyUsePeriod } from '../../entities/technology-use-period.entity.js';
import type { TechnologyDetail } from './load-technology-detail.types.js';

/**
 * Everything a technology's detail shows (#42): the technology, its quadrant
 * and ring, its areas, the stretches it spent in each ring — oldest first, so
 * the list is its ring history — and the projects that use it. Nothing for an
 * id that names no technology.
 *
 * Its links are resolved by the load (ADR 0018), and the periods and projects
 * are filtered on their links to it, which the static adapter compares by id.
 */
export async function loadTechnologyDetail(
  content: StaticContent,
  id: string,
): Promise<TechnologyDetail | undefined> {
  const [[technology], periods, projects] = await Promise.all([
    content.loadAll(
      Technology,
      { filtering: [{ property: 'id', operator: 'eq', value: id }] },
      { resolve: ['quadrant', 'ring', 'areas'] },
    ),
    content.loadAll(
      TechnologyUsePeriod,
      {
        filtering: [{ property: 'technology', operator: 'eq', value: id }],
        sorting: [{ 0: { property: 'start', type: 'asc' } }],
      },
      { resolve: ['ring'] },
    ),
    // `in` over a collection matches any of its ids, as Mongo's does.
    content.loadAll(Project, {
      filtering: [{ property: 'technologies', operator: 'in', values: [id] }],
      sorting: [{ 0: { property: 'order', type: 'asc' } }],
    }),
  ]);
  if (technology === undefined) return undefined;

  return {
    technology,
    quadrant: targetOf(technology.quadrant),
    ring: targetOf(technology.ring),
    areas: targetsOf(technology.areas),
    history: periods.map(period => ({
      ring: targetOf(period.ring),
      // Validation has made every start present.
      start: period.start as Date,
      end: period.end,
    })),
    projects,
  };
}
