import {
  type StaticContent,
  targetOf,
} from '@myself-app/entifix-incubator-static-adapter';

import { RadarEdition } from '../../entities/radar-edition.entity.js';
import { Technology } from '../../entities/technology.entity.js';
import { TechnologyUsePeriod } from '../../entities/technology-use-period.entity.js';
import type {
  Movement,
  RadarPlacement,
  RingPeriod,
} from './load-radar-placements.types.js';

/**
 * The date the radar compares against: the latest `RadarEdition` in content
 * (#39, ADR 0014). A technology moved if the ring it sat in on this date is
 * not the ring it sits in now, and is new if it sat in none. Kept in content
 * rather than taken from the build's clock, so the same content always draws
 * the same radar.
 */
export async function loadEditionDate(content: StaticContent): Promise<Date> {
  const editions = await content.loadAll(RadarEdition, {
    sorting: [{ 0: { property: 'date', type: 'desc' } }],
  });
  // Validation requires at least one edition, with a date.
  return editions[0].date as Date;
}

/** How a technology moved since `edition`, from the periods it spent in rings. */
export function movementOf(
  periods: readonly RingPeriod[],
  edition: Date,
): Movement {
  const ordered = [...periods].sort(
    (a, b) => a.start.getTime() - b.start.getTime(),
  );
  const current = ordered.at(-1);
  if (current === undefined) return 'none';
  const then = ordered.find(
    period =>
      period.start <= edition &&
      (period.end === undefined || period.end > edition),
  );
  if (then === undefined) return 'new';
  if (then.ring > current.ring) return 'in';
  if (then.ring < current.ring) return 'out';
  return 'none';
}

/**
 * Every technology placed on the radar — its quadrant, its ring and how it
 * moved — in no particular order: the chart's layout numbers them.
 */
export async function loadRadarPlacements(
  content: StaticContent,
): Promise<RadarPlacement[]> {
  const [technologies, periods, edition] = await Promise.all([
    content.loadAll(Technology, {}, { resolve: ['quadrant', 'ring'] }),
    content.loadAll(TechnologyUsePeriod, {}, { resolve: ['ring'] }),
    loadEditionDate(content),
  ]);

  return technologies.map(technology => {
    const ringPeriods = periods
      .filter(period => period.technology.id === technology.id)
      .map(period => ({
        ring: targetOf(period.ring).order,
        start: period.start as Date,
        end: period.end,
      }));
    return {
      technology,
      quadrant: targetOf(technology.quadrant),
      ring: targetOf(technology.ring),
      movement: movementOf(ringPeriods, edition),
    };
  });
}
