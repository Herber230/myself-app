import type { Quadrant } from '../../entities/quadrant.entity.js';
import type { Ring } from '../../entities/ring.entity.js';
import type { Technology } from '../../entities/technology.entity.js';

/**
 * How a technology moved since the last edition: `in` is towards the centre —
 * a lower ring order — and `out` away from it, as the reference radar draws
 * them.
 */
export type Movement = 'in' | 'out' | 'new' | 'none';

/** One stretch in one ring, by the ring's order. */
export interface RingPeriod {
  readonly ring: number;
  readonly start: Date;
  readonly end?: Date;
}

/** Where a technology sits on the radar, and how it got there. */
export interface RadarPlacement {
  readonly technology: Technology;
  readonly quadrant: Quadrant;
  readonly ring: Ring;
  readonly movement: Movement;
}
