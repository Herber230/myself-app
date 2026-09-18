/**
 * The radar's entries, read from content.
 *
 * The control knows nothing of entities (ADR 0009): it takes `RadarEntry`, a
 * plain shape with a quadrant and a ring by index. This is where the records
 * become that shape — the quadrant and ring by their `order`, and a blip's
 * movement from the periods it spent in each ring.
 */
import {
  Quadrant,
  Ring,
  Technology,
  TechnologyUsePeriod,
} from '@myself-app/domain';

import type {
  Movement,
  QuadrantIndex,
  RadarEntry,
  RingIndex,
} from '../components/tech-radar/types';
import { loadEvery } from './queries';
import type { SiteRepositories } from './site-content';

/**
 * The edition the radar compares against: a blip moved if the ring it sat in
 * on this date is not the ring it sits in now, and is new if it sat in none.
 *
 * ⚠️ Placeholder, like the periods it is compared with. How often the radar is
 * re-drawn, and so what "moved" is measured from, is for the radar spec to
 * decide (#39).
 */
export const PREVIOUS_EDITION = new Date('2026-01-01T00:00:00.000Z');

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
  edition: Date = PREVIOUS_EDITION,
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
  repositories: SiteRepositories,
  edition: Date = PREVIOUS_EDITION,
): Promise<RadarEntry[]> {
  const [technologies, quadrants, rings, periods] = await Promise.all([
    loadEvery(repositories, Technology),
    loadEvery(repositories, Quadrant),
    loadEvery(repositories, Ring),
    loadEvery(repositories, TechnologyUsePeriod),
  ]);

  const quadrantOrder = new Map(quadrants.map(each => [each.id, each.order]));
  const ringOrder = new Map(rings.map(each => [each.id, each.order]));

  return technologies.map(technology => {
    const ringPeriods = periods
      .filter(period => period.technology.id === technology.id)
      .map(period => ({
        ring: toIndex(
          ringOrder.get(period.ring.id),
          `ring ${String(period.ring.id)}`,
        ),
        start: period.start as Date,
        end: period.end,
      }));
    // Validation has made every one of these present; the casts say so.
    const label = technology.name as RadarEntry['label'];
    return {
      id: String(technology.id),
      label,
      quadrant: toIndex(
        quadrantOrder.get(technology.quadrant.id),
        `quadrant ${String(technology.quadrant.id)}`,
      ) as QuadrantIndex,
      ring: toIndex(
        ringOrder.get(technology.ring.id),
        `ring ${String(technology.ring.id)}`,
      ) as RingIndex,
      movement: movementOf(ringPeriods, edition),
    };
  });
}
