/**
 * The content the site ships, and the rules only this site knows.
 *
 * The first case is the one that matters most: the real content passes. The
 * rest break it on purpose, one rule at a time, and check the build would stop
 * with the path to what is wrong.
 */
import { CONTENT } from '@myself-app/content';
import {
  ContactChannel,
  EmploymentPeriod,
  Profile,
  Technology,
} from '@myself-app/domain';
import { ContentValidationError } from '@myself-app/static-adapter';
import { describe, expect, it } from 'vitest';

import { loadEvery } from './queries';
import { buildSiteRepositories, CONTENT_SOURCES } from './site-content';

type Content = Record<string, readonly unknown[]>;

/** The content with one file replaced. */
const withFile = (file: string, records: unknown[]): Content => ({
  ...CONTENT,
  [file]: records,
});

/** Every problem `buildSiteRepositories` reports for some content. */
function problemsIn(content: Content): string[] {
  try {
    buildSiteRepositories(content);
  } catch (error) {
    expect(error).toBeInstanceOf(ContentValidationError);
    return (error as ContentValidationError).problems.map(
      problem => `${problem.path} ${problem.message}`,
    );
  }
  return [];
}

const records = (file: string) =>
  structuredClone(CONTENT[file]) as Record<string, unknown>[];

describe('the content the site ships', () => {
  it('has a source for every file, and a file for every source', () => {
    expect(CONTENT_SOURCES.map(source => source.file).sort()).toEqual(
      Object.keys(CONTENT).sort(),
    );
  });

  it('passes every rule', () => {
    expect(problemsIn(CONTENT)).toEqual([]);
  });

  it('is served, with its links and dates in place', async () => {
    const repositories = buildSiteRepositories(CONTENT);
    const [profile] = await loadEvery(repositories, Profile);
    expect(profile.firstName).toBe('Herber');

    const periods = await loadEvery(repositories, EmploymentPeriod);
    for (const period of periods) {
      expect(period.start, String(period.id)).toBeInstanceOf(Date);
      expect(period.employer.id, String(period.id)).toBeTypeOf('string');
    }

    const technologies = await loadEvery(repositories, Technology);
    expect(technologies.length).toBe(CONTENT['technologies.json'].length);
  });
});

describe('a rule only this site knows', () => {
  it('stops a second channel of the same type', () => {
    const channels = records('contact-channels.json');
    channels.push({ ...channels[0], id: 'email-again' });
    expect(problemsIn(withFile('contact-channels.json', channels))).toEqual([
      'contact-channels.json › email-again › type is a second email channel',
    ]);
  });

  it('stops a period that ends before it starts', () => {
    const periods = records('employment-periods.json');
    periods[0] = { ...periods[0], start: '2022-01-01', end: '2021-01-01' };
    expect(problemsIn(withFile('employment-periods.json', periods))).toEqual([
      `employment-periods.json › ${String(periods[0].id)} › end is before start`,
    ]);
  });

  it('stops a second profile, and a missing one', () => {
    const profile = records('profile.json');
    expect(
      problemsIn(
        withFile('profile.json', [...profile, { ...profile[0], id: 'twin' }]),
      ),
    ).toEqual([
      'profile.json › herber-colop holds 2 records, where one is expected',
    ]);
    expect(problemsIn(withFile('profile.json', []))).toEqual([
      'profile.json › #0 holds 0 records, where one is expected',
    ]);
  });
});

describe('a link between files', () => {
  it('stops an id that names nothing in the file it points into', () => {
    const technologies = records('technologies.json');
    technologies[0] = { ...technologies[0], ring: 'orbit' };
    expect(problemsIn(withFile('technologies.json', technologies))).toEqual([
      `technologies.json › ${String(technologies[0].id)} › ring points at "orbit", which does not exist`,
    ]);
  });

  it('reads a missing file as one with no records', () => {
    const { ['rings.json']: _rings, ...withoutRings } = CONTENT;
    const problems = problemsIn(withoutRings);
    // Every technology and use period now points at a ring that does not exist.
    expect(problems.length).toBeGreaterThan(0);
    expect(problems.every(problem => problem.includes('ring points at'))).toBe(
      true,
    );
  });

  it('ignores a record that has no id when collecting targets', () => {
    // A broken record is reported by its own file; the files that link into
    // it are not also blamed for its missing id.
    // Technologies link into the areas, so the areas' ids are collected.
    const areas = [...records('technology-areas.json'), 'not a record', null];
    expect(problemsIn(withFile('technology-areas.json', areas))).toEqual([
      'technology-areas.json › #4 is not a record',
      'technology-areas.json › #5 is not a record',
    ]);
  });
});

describe('every problem, across files', () => {
  it('is reported together rather than one file at a time', () => {
    const channels = records('contact-channels.json');
    channels[0] = { ...channels[0], url: undefined };
    const areas = records('technology-areas.json');
    areas[0] = { ...areas[0], name: { en: 'Only English' } };
    const content = {
      ...withFile('contact-channels.json', channels),
      'technology-areas.json': areas,
    };
    expect(problemsIn(content)).toEqual([
      'contact-channels.json › email › url is required, and is missing',
      'technology-areas.json › server-side-rendering › name is missing "es"',
    ]);
  });
});

describe('the channel type', () => {
  it('is checked against the values the entity declares', () => {
    const channels = records('contact-channels.json');
    channels[0] = { ...channels[0], type: 'fax' };
    const [problem] = problemsIn(withFile('contact-channels.json', channels));
    expect(problem).toContain('type holds "fax", which is not one of');
    expect(new ContactChannel().type).toBe('email');
  });
});
