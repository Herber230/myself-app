import { describe, expect, it } from 'vitest';

import {
  connectsOthers,
  folderOrNote,
  jobInItsWorkflow,
  oneChannelPerType,
  refusesOthers,
  statusMatchesSupersession,
  supersedesWithinProject,
  travelsBothEnds,
  variantIdNotReserved,
} from './rules.js';

/** Every problem a rule reports, as `index › member › message`. */
function problemsOf(
  rule: typeof oneChannelPerType,
  records: ReadonlyArray<Record<string, unknown>>,
): string[] {
  const problems: string[] = [];
  rule(records, (index, member, message) =>
    problems.push(`${index} › ${member} › ${message}`),
  );
  return problems;
}

describe('one channel per type', () => {
  it('lets one channel of each type through', () => {
    expect(
      problemsOf(oneChannelPerType, [{ type: 'email' }, { type: 'github' }]),
    ).toEqual([]);
  });

  it('reports each channel after the first of its type', () => {
    expect(
      problemsOf(oneChannelPerType, [
        { type: 'email' },
        { type: 'email' },
        { type: 'github' },
        { type: 'email' },
      ]),
    ).toEqual([
      '1 › type › is a second email channel',
      '3 › type › is a second email channel',
    ]);
  });
});

describe('a variant id that is not reserved', () => {
  it('lets any id but ats through', () => {
    expect(
      problemsOf(variantIdNotReserved, [{ id: 'fullstack' }, { id: 'atsy' }]),
    ).toEqual([]);
  });

  it('reports a variant named ats', () => {
    expect(
      problemsOf(variantIdNotReserved, [{ id: 'fullstack' }, { id: 'ats' }]),
    ).toEqual(['1 › id › is "ats", which the CV reserves for its ATS mode']);
  });
});

describe('supersession within a project', () => {
  it('lets a record replace records of its own project', () => {
    expect(
      problemsOf(supersedesWithinProject, [
        { id: 'app-0002', project: 'app', supersedes: ['app-0001'] },
        { id: 'app-0001', project: 'app' },
      ]),
    ).toEqual([]);
  });

  it("reports a record naming another project's", () => {
    expect(
      problemsOf(supersedesWithinProject, [
        {
          id: 'app-0002',
          project: 'app',
          supersedes: ['lib-0001', 'app-0001'],
        },
      ]),
    ).toEqual(['0 › supersedes › names lib-0001, outside project app']);
  });
});

describe('a status that matches supersession', () => {
  it('lets a superseded record through when another names it', () => {
    expect(
      problemsOf(statusMatchesSupersession, [
        { id: 'a', status: 'superseded' },
        { id: 'b', status: 'superseded-in-part' },
        { id: 'c', status: 'accepted', supersedes: ['a', 'b'] },
      ]),
    ).toEqual([]);
  });

  it('reports a superseded record nothing names, and a named one not marked', () => {
    expect(
      problemsOf(statusMatchesSupersession, [
        { id: 'a', status: 'superseded' },
        { id: 'b', status: 'accepted' },
        { id: 'c', status: 'proposed', supersedes: ['b'] },
      ]),
    ).toEqual([
      '0 › status › is superseded, but nothing supersedes it',
      '1 › status › is accepted, but a later record supersedes it',
    ]);
  });
});

describe('the architecture views (ADR 0022, 0023)', () => {
  it('want a package to name its folder or carry a note', () => {
    expect(
      problemsOf(folderOrNote, [
        { folder: 'src' },
        { note: { en: 'a', es: 'a' } },
        {},
      ]),
    ).toEqual(['2 › note › is missing, and no folder gives one']);
  });

  it('want a step to travel both ends of a line, or none', () => {
    expect(
      problemsOf(travelsBothEnds, [
        {},
        { from: 'a', to: 'b' },
        { from: 'a' },
        { to: 'b' },
      ]),
    ).toEqual([
      '2 › to › is missing, while the other end is set',
      '3 › from › is missing, while the other end is set',
    ]);
  });

  it('refuse a part connected to itself', () => {
    expect(
      problemsOf(connectsOthers, [
        { id: 'a' },
        { id: 'b', connects: ['a'] },
        { id: 'c', connects: ['c'] },
      ]),
    ).toEqual(['2 › connects › names the part itself']);
  });

  it('refuse an import refused from a package to itself', () => {
    expect(
      problemsOf(refusesOthers, [
        { from: 'a', to: 'b' },
        { from: 'a', to: 'a' },
      ]),
    ).toEqual(['1 › to › is the package it starts from']);
  });

  it('want a job key only with its workflow', () => {
    expect(
      problemsOf(jobInItsWorkflow, [
        {},
        { workflow: 'ci.yml', job: 'test' },
        { job: 'test' },
      ]),
    ).toEqual(['2 › workflow › is missing, while job names a key in it']);
  });
});
