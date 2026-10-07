import {
  EmploymentPeriod,
  Technology,
  TechnologyUsePeriod,
} from '@myself-app/domain';
import { describe, expect, it } from 'vitest';

import { SITE_CONTENT } from '../shipped-content.fixture.js';

/**
 * The radar is the career, not a wish list: every technology on it has a
 * history of its own, and that history agrees with the jobs that name it. A
 * technology stands apart from the projects: a job or a featured project is
 * where it was used, when one is shown, not what puts it on the radar.
 */
describe("the radar's history", () => {
  it('has a history for every technology', async () => {
    const [technologies, periods] = await Promise.all([
      SITE_CONTENT.loadAll(Technology, {}),
      SITE_CONTENT.loadAll(TechnologyUsePeriod, {}),
    ]);
    const placed = new Set(periods.map(period => period.technology.id));
    expect(
      technologies.map(each => each.id).filter(id => !placed.has(id)),
    ).toEqual([]);
  });

  it('starts each technology before the end of every job that used it', async () => {
    const [employments, periods] = await Promise.all([
      SITE_CONTENT.loadAll(EmploymentPeriod, {}),
      SITE_CONTENT.loadAll(TechnologyUsePeriod, {}),
    ]);
    const firstUse = new Map<unknown, number>();
    for (const period of periods) {
      const start = (period.start as Date).getTime();
      const id = period.technology.id;
      firstUse.set(id, Math.min(firstUse.get(id) ?? start, start));
    }
    const late = employments.flatMap(employment =>
      employment.technologies.ids
        .filter(
          id =>
            (firstUse.get(id) as number) >=
            (employment.end ?? new Date(8.64e15)).getTime(),
        )
        .map(id => `${String(id)} at ${String(employment.id)}`),
    );
    expect(late).toEqual([]);
  });
});
