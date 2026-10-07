import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { readReleasePolicy, releasePolicyOf } from './release-policy';

const CHANGELOG = `# Changelog

## [1.10.0](https://github.com/o/r/compare/v1.9.0...v1.10.0) (2026-10-07)

### Features

* something

## [1.9.0](https://github.com/o/r/compare/v1.8.0...v1.9.0) (2026-10-04)
`;

const CONFIG = {
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      { releaseRules: [{ type: 'perf', release: 'patch' }] },
    ],
    [
      '@semantic-release/release-notes-generator',
      {
        presetConfig: {
          types: [
            { type: 'feat', section: 'Features' },
            { type: 'perf', section: 'Performance' },
            { type: 'docs', hidden: true },
          ],
        },
      },
    ],
    '@semantic-release/github',
  ],
} as const;

describe('the release policy', () => {
  it('names the latest release and the repository its links name', () => {
    const policy = releasePolicyOf(CHANGELOG, CONFIG);
    expect(policy?.version).toBe('1.10.0');
    expect(policy?.repositoryUrl).toBe('https://github.com/o/r');
  });

  it('levels each type by the release rules, else by the preset, and drops a hidden section', () => {
    expect(releasePolicyOf(CHANGELOG, CONFIG)?.types).toEqual([
      { type: 'feat', level: 'minor', section: 'Features' },
      { type: 'perf', level: 'patch', section: 'Performance' },
      { type: 'docs' },
    ]);
  });

  it('is nothing before the first release, and reads no types from a bare config', () => {
    expect(releasePolicyOf('# Changelog\n', CONFIG)).toBeUndefined();
    expect(
      releasePolicyOf(CHANGELOG, { plugins: ['@semantic-release/github'] })
        ?.types,
    ).toEqual([]);
  });
});

describe('reading it from the repository', () => {
  let root: string | undefined;
  afterEach(() => {
    if (root) rmSync(root, { recursive: true, force: true });
  });

  it('reads both files from the root it is given', () => {
    root = mkdtempSync(join(tmpdir(), 'release-'));
    writeFileSync(join(root, 'CHANGELOG.md'), CHANGELOG);
    writeFileSync(join(root, '.releaserc.json'), JSON.stringify(CONFIG));
    expect(readReleasePolicy(root)?.version).toBe('1.10.0');
  });

  it('reads this repository’s by default, as the build does from the app', () => {
    const policy = readReleasePolicy(join(process.cwd(), '..', '..'));
    expect(policy?.repositoryUrl).toBe(
      'https://github.com/Herber230/myself-app',
    );
    expect(policy?.types.find(each => each.type === 'perf')?.level).toBe(
      'patch',
    );
    expect(readReleasePolicy()).toEqual(policy);
  });
});
