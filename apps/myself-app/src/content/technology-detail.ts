/**
 * Everything a blip's detail shows (#42): the technology, its quadrant and
 * ring, its areas, the
 * stretches it spent in each ring — oldest first, so the list is its ring
 * history — and the projects that use it.
 *
 * `areas` and a project's `technologies` are collections, which no request
 * may filter on (`describeEntityColumns` throws on a queryable collection), so
 * those two are matched here, as the radar does.
 */
import {
  Project,
  Quadrant,
  Ring,
  Technology,
  TechnologyArea,
  TechnologyUsePeriod,
} from '@myself-app/domain';

import { loadEvery } from './queries';
import type { SiteRepositories } from './site-content';

/** One stretch in one ring. */
export interface RingStretch {
  readonly ring: Ring;
  readonly start: Date;
  readonly end?: Date;
}

export interface TechnologyDetail {
  readonly technology: Technology;
  readonly quadrant: Quadrant;
  /** Where it sits now. */
  readonly ring: Ring;
  /** In the order the technology lists them. */
  readonly areas: readonly TechnologyArea[];
  /** Oldest first. */
  readonly history: readonly RingStretch[];
  /** By the projects' own order. */
  readonly projects: readonly Project[];
}

export async function loadTechnologyDetail(
  repositories: SiteRepositories,
  id: string,
): Promise<TechnologyDetail | undefined> {
  const [technologies, quadrants, areas, rings, periods, projects] =
    await Promise.all([
      loadEvery(repositories, Technology),
      loadEvery(repositories, Quadrant),
      loadEvery(repositories, TechnologyArea),
      loadEvery(repositories, Ring),
      loadEvery(repositories, TechnologyUsePeriod, {
        sorting: [{ 0: { property: 'start', type: 'asc' } }],
      }),
      loadEvery(repositories, Project, {
        sorting: [{ 0: { property: 'order', type: 'asc' } }],
      }),
    ]);

  const technology = technologies.find(each => each.id === id);
  if (technology === undefined) return undefined;

  // Validation has checked every link, so each id below names a record.
  const areaById = new Map(areas.map(each => [each.id, each]));
  const ringById = new Map(rings.map(each => [each.id, each]));

  return {
    technology,
    quadrant: quadrants.find(
      each => each.id === technology.quadrant.id,
    ) as Quadrant,
    ring: ringById.get(technology.ring.id) as Ring,
    areas: technology.areas.ids.map(
      areaId => areaById.get(areaId) as TechnologyArea,
    ),
    history: periods
      .filter(period => period.technology.id === id)
      .map(period => ({
        ring: ringById.get(period.ring.id) as Ring,
        start: period.start as Date,
        end: period.end,
      })),
    projects: projects.filter(project => project.technologies.ids.includes(id)),
  };
}
