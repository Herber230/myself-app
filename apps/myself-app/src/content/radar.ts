/**
 * The radar's entries, read from content.
 *
 * The control knows nothing of entities (ADR 0009): it takes `RadarEntry`, a
 * plain shape with a quadrant and a ring by index. This is where the records
 * become that shape — the quadrant and ring by their `order`, and a blip's
 * movement from the periods it spent in each ring.
 */
import {
  type Quadrant,
  RadarEdition,
  type Ring,
  Technology,
  TechnologyUsePeriod,
} from '@myself-app/domain';
import { targetOf } from '@myself-app/static-adapter';

import type {
  Movement,
  QuadrantIndex,
  RadarEntry,
  RingIndex,
} from '../components/tech-radar/types';
import type { SiteContent } from './site-content';

/**
 * The date the radar compares against: the latest `RadarEdition` in content
 * (#39, ADR 0014). A blip moved if the ring it sat in on this date is not the
 * ring it sits in now, and is new if it sat in none. Kept in content rather
 * than taken from the build's clock, so the same content always draws the
 * same radar.
 */
export async function loadEditionDate(content: SiteContent): Promise<Date> {
  const editions = await content.loadAll(RadarEdition, {
    sorting: [{ 0: { property: 'date', type: 'desc' } }],
  });
  // Validation requires at least one edition, with a date.
  return editions[0].date as Date;
}

/** One stretch in one ring, by the ring's order. */
export interface RingPeriod {
  readonly ring: number;
  readonly start: Date;
  readonly end?: Date;
}

/**
 * How a blip moved since `edition`. `in` is towards the centre — a lower ring
 * order — and `out` away from it, as the reference radar draws them.
 */
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

function toIndex(order: number | undefined, what: string): number {
  if (
    order === undefined ||
    !Number.isInteger(order) ||
    order < 0 ||
    order > 3
  ) {
    throw new RangeError(
      `${what} has order ${String(order)}; the radar draws four, 0 to 3`,
    );
  }
  return order;
}

/** Every technology as a blip, in no particular order: the layout numbers them. */
export async function loadRadarEntries(
  content: SiteContent,
): Promise<RadarEntry[]> {
  const [technologies, periods, edition] = await Promise.all([
    content.loadAll(Technology, {}, { resolve: ['quadrant', 'ring'] }),
    content.loadAll(TechnologyUsePeriod, {}, { resolve: ['ring'] }),
    loadEditionDate(content),
  ]);

  const orderOf = (record: Quadrant | Ring, what: string) =>
    toIndex(record.order, `${what} ${String(record.id)}`);

  return technologies.map(technology => {
    const ringPeriods = periods
      .filter(period => period.technology.id === technology.id)
      .map(period => ({
        ring: orderOf(targetOf(period.ring), 'ring'),
        start: period.start as Date,
        end: period.end,
      }));
    // Validation has made the name present; the cast says so.
    const label = technology.name as RadarEntry['label'];
    return {
      id: String(technology.id),
      label,
      quadrant: orderOf(
        targetOf(technology.quadrant),
        'quadrant',
      ) as QuadrantIndex,
      ring: orderOf(targetOf(technology.ring), 'ring') as RingIndex,
      movement: movementOf(ringPeriods, edition),
      areas: technology.areas.ids.map(String),
    };
  });
}
