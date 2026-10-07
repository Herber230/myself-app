import {
  EmploymentPeriod,
  Project,
  Technology,
  TechnologyUsePeriod,
} from '@myself-app/domain';
import { describe, expect, it } from 'vitest';

import { SITE_CONTENT } from '../shipped-content.fixture.js';

/**
 * The radar is the career, not a wish list: every technology on it was used
 * at a job or in a project, and its history agrees with the jobs that name it.
 */
describe("the radar's history", () => {
  it('has every technology used at an employment or in a project', async () => {
    const [technologies, employments, projects] = await Promise.all([
      SITE_CONTENT.loadAll(Technology, {}),
      SITE_CONTENT.loadAll(EmploymentPeriod, {}),
      SITE_CONTENT.loadAll(Project, {}),
    ]);
    const used = new Set(
      [...employments, ...projects].flatMap(each => each.technologies.ids),
    );
    expect(
      technologies.map(each => each.id).filter(id => !used.has(id)),
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
