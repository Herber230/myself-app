import { describe, expect, it } from 'vitest';

import {
  changelogEntry,
  commitLine,
  levelOf,
  nextVersion,
  type ReleaseDecisionPolicy,
} from './release-rules.js';

const POLICY: ReleaseDecisionPolicy = {
  version: '1.10.0',
  repositoryUrl: 'https://github.com/o/r',
  types: [
    { type: 'feat', level: 'minor', section: 'Features' },
    { type: 'fix', level: 'patch', section: 'Bug Fixes' },
    { type: 'docs' },
  ],
};

const commit = (type: string, breaking = false) => ({
  type,
  breaking,
  description: 'a change',
});

describe('the release a squash commit makes', () => {
  it('is its type’s level, a major when breaking, and nothing for a type that releases none', () => {
    expect(levelOf(POLICY, commit('feat'))).toBe('minor');
    expect(levelOf(POLICY, commit('fix'))).toBe('patch');
    expect(levelOf(POLICY, commit('docs'))).toBeUndefined();
    expect(levelOf(POLICY, commit('unknown'))).toBeUndefined();
    expect(levelOf(POLICY, commit('docs', true))).toBe('major');
  });

  it('raises the version by that level', () => {
    expect(nextVersion('1.10.3', 'major')).toBe('2.0.0');
    expect(nextVersion('1.10.3', 'minor')).toBe('1.11.0');
    expect(nextVersion('1.10.3', 'patch')).toBe('1.10.4');
  });

  it('writes the subject with its ! when breaking', () => {
    expect(commitLine(commit('feat'))).toBe('feat: a change');
    expect(commitLine(commit('feat', true))).toBe('feat!: a change');
  });

  it('writes the notes as the preset does: a heading, then the breaking change and the section', () => {
    expect(changelogEntry(POLICY, commit('feat'), '2026-10-07')).toBe(
      [
        '## [1.11.0](https://github.com/o/r/compare/v1.10.0...v1.11.0) (2026-10-07)',
        '',
        '### Features',
        '',
        '* a change',
      ].join('\n'),
    );
    // A hidden type that breaks still writes its breaking change.
    expect(changelogEntry(POLICY, commit('docs', true), '2026-10-07')).toBe(
      [
        '## [2.0.0](https://github.com/o/r/compare/v1.10.0...v2.0.0) (2026-10-07)',
        '',
        '### ⚠ BREAKING CHANGES',
        '',
        '* a change',
      ].join('\n'),
    );
    expect(
      changelogEntry(POLICY, commit('docs'), '2026-10-07'),
    ).toBeUndefined();
  });
});
