/**
 * This repository's release policy, read at build (ADR 0021, 0023): the
 * latest version from `CHANGELOG.md`, which the release commits before the
 * deploy builds, and what each commit type releases from `.releaserc.json`.
 * The release decision on the project's page is drawn from them, so it
 * cannot disagree with the release it describes.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export type ReleaseLevel = 'major' | 'minor' | 'patch';

export interface ReleaseType {
  readonly type: string;
  /** What it releases on its own; nothing for a type that releases nothing. */
  readonly level?: ReleaseLevel;
  /** Its section in the notes; nothing for a type the notes hide. */
  readonly section?: string;
}

export interface ReleasePolicy {
  /** `1.10.0`. */
  readonly version: string;
  /** The repository the changelog's compare links name. */
  readonly repositoryUrl: string;
  readonly types: readonly ReleaseType[];
}

const HEADING =
  /^## \[(\d+\.\d+\.\d+)\]\((https:\/\/github\.com\/[^/]+\/[^/]+)\/compare\//m;

/** The `conventionalcommits` preset's own levels, before `releaseRules`. */
const PRESET_LEVELS: Readonly<Record<string, ReleaseLevel>> = {
  feat: 'minor',
  fix: 'patch',
};

interface ReleaseConfig {
  readonly plugins: readonly (
    string | readonly [string, Record<string, unknown>]
  )[];
}

function optionsOf(config: ReleaseConfig, plugin: string) {
  const entry = config.plugins.find(each =>
    Array.isArray(each) ? each[0] === plugin : each === plugin,
  );
  return (Array.isArray(entry) ? entry[1] : {}) as Record<string, unknown>;
}

/** The policy, from a changelog and a semantic-release config. */
export function releasePolicyOf(
  changelog: string,
  config: ReleaseConfig,
): ReleasePolicy | undefined {
  const latest = HEADING.exec(changelog);
  if (latest === null) return undefined;
  const rules = (optionsOf(config, '@semantic-release/commit-analyzer')
    .releaseRules ?? []) as readonly { type: string; release: ReleaseLevel }[];
  const sections = ((
    optionsOf(config, '@semantic-release/release-notes-generator')
      .presetConfig as { types?: unknown } | undefined
  )?.types ?? []) as readonly {
    type: string;
    section?: string;
    hidden?: boolean;
  }[];
  return {
    version: latest[1] as string,
    repositoryUrl: latest[2] as string,
    types: sections.map(({ type, section, hidden }) => {
      const level =
        rules.find(rule => rule.type === type)?.release ?? PRESET_LEVELS[type];
      return {
        type,
        ...(level && { level }),
        ...(!hidden && section && { section }),
      };
    }),
  };
}

/** The build runs from the app's folder; both files are at the root. */
export function readReleasePolicy(
  root = join(process.cwd(), '..', '..'),
): ReleasePolicy | undefined {
  return releasePolicyOf(
    readFileSync(join(root, 'CHANGELOG.md'), 'utf8'),
    JSON.parse(
      readFileSync(join(root, '.releaserc.json'), 'utf8'),
    ) as ReleaseConfig,
  );
}
