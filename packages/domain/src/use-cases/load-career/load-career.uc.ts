import {
  type StaticContent,
  targetOf,
} from '@myself-app/entifix-incubator-static-adapter';

import type { Employer } from '../../entities/employer.entity.js';
import { EmploymentPeriod } from '../../entities/employment-period.entity.js';

/** A career at a glance, for the landing's about section. */
export interface Career {
  /** When the first employment started; none without one. */
  readonly since?: Date;
  /** The latest employment that has not ended, and its employer. */
  readonly current?: {
    readonly period: EmploymentPeriod;
    readonly employer: Employer;
  };
}

/**
 * The facts beside the bio: how long, and where now. Read from the
 * employments rather than written in the bio, so they never go stale.
 */
export async function loadCareer(content: StaticContent): Promise<Career> {
  const periods = await content.loadAll(
    EmploymentPeriod,
    { sorting: [{ 0: { property: 'start', type: 'asc' } }] },
    { resolve: ['employer'] },
  );
  const current = [...periods]
    .reverse()
    .find(period => period.end === undefined);
  return {
    since: periods[0]?.start,
    current: current && {
      period: current,
      employer: targetOf(current.employer),
    },
  };
}
