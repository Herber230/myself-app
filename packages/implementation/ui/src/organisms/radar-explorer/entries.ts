/**
 * The radar's placements as the chart draws them.
 *
 * The control knows nothing of entities (ADR 0009): it takes `RadarEntry`, a
 * plain shape with a quadrant and a ring by index. This is where a placement
 * becomes that shape — the quadrant and ring by their `order`, which the chart
 * can only draw from 0 to 3.
 */
import type { RadarPlacement } from '@myself-app/domain/use-cases';
import {
  type QuadrantIndex,
  type RadarEntry,
  type RingIndex,
} from '@myself-app/entifix-incubator-react-controls';

function toIndex(order: number, what: string): number {
  if (!Number.isInteger(order) || order < 0 || order > 3) {
    throw new RangeError(
      `${what} has order ${String(order)}; the radar draws four, 0 to 3`,
    );
  }
  return order;
}

/** Every placement as a blip, in the order given: the layout numbers them. */
export function radarEntriesOf(
  placements: readonly RadarPlacement[],
): RadarEntry[] {
  return placements.map(({ technology, quadrant, ring, movement }) => ({
    id: String(technology.id),
    // Validation has made the name present; the cast says so.
    label: technology.name as RadarEntry['label'],
    quadrant: toIndex(
      quadrant.order,
      `quadrant ${String(quadrant.id)}`,
    ) as QuadrantIndex,
    ring: toIndex(ring.order, `ring ${String(ring.id)}`) as RingIndex,
    movement,
    areas: technology.areas.ids.map(String),
  }));
}
