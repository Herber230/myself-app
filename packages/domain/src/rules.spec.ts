import { describe, expect, it } from 'vitest';

import { oneChannelPerType, variantIdNotReserved } from './rules.js';

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
