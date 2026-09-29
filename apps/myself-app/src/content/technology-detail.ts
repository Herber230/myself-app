/**
 * Everything a blip's detail shows (#42): the technology, its quadrant and
 * ring, its areas, the
 * stretches it spent in each ring — oldest first, so the list is its ring
 * history — and the projects that use it.
 *
 * Its links are resolved by the load (ADR 0018), and the periods and projects
 * are filtered on their links to it, which the static adapter compares by id.
 */
import {
  Project,
  type Quadrant,
  type Ring,
  Technology,
  type TechnologyArea,
  TechnologyUsePeriod,
} from '@myself-app/domain';
import {
  targetOf,
  targetsOf,
} from '@myself-app/entifix-incubator-static-adapter';

import type { SiteContent } from './site-content';

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
  content: SiteContent,
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
