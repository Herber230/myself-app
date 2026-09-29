import type { Project } from '../../entities/project.entity.js';
import type { Quadrant } from '../../entities/quadrant.entity.js';
import type { Ring } from '../../entities/ring.entity.js';
import type { Technology } from '../../entities/technology.entity.js';
import type { TechnologyArea } from '../../entities/technology-area.entity.js';

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
