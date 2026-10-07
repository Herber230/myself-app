/**
 * What a squash commit releases (ADR 0013, 0021, 0023), from the policy the
 * route read out of `.releaserc.json` and `CHANGELOG.md` at build.
 */

export type ReleaseLevel = 'major' | 'minor' | 'patch';

export interface ReleaseDecisionPolicy {
  /** The latest release: `1.10.0`. */
  readonly version: string;
  /** The repository its compare links name. */
  readonly repositoryUrl: string;
  /** Every type the notes know, in their order. */
  readonly types: readonly {
    readonly type: string;
    readonly level?: ReleaseLevel;
    readonly section?: string;
  }[];
}

export interface ReleaseCommit {
  readonly type: string;
  /** Marked with `!`: a breaking change. */
  readonly breaking: boolean;
  readonly description: string;
}

/** What it releases: a breaking change a major, else its type's level. */
export function levelOf(
  policy: ReleaseDecisionPolicy,
  commit: ReleaseCommit,
): ReleaseLevel | undefined {
  if (commit.breaking) return 'major';
  return policy.types.find(each => each.type === commit.type)?.level;
}

/** `1.10.0` raised by `level`. */
export function nextVersion(version: string, level: ReleaseLevel): string {
  const [major, minor, patch] = version.split('.').map(Number) as [
    number,
    number,
    number,
  ];
  if (level === 'major') return `${major + 1}.0.0`;
  if (level === 'minor') return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

/** The squash commit's subject: `feat!: …`. */
export function commitLine(commit: ReleaseCommit): string {
  return `${commit.type}${commit.breaking ? '!' : ''}: ${commit.description}`;
}

/**
 * The notes the release prepends to `CHANGELOG.md`, as the
 * `conventionalcommits` preset writes them: nothing when it releases nothing.
 */
export function changelogEntry(
  policy: ReleaseDecisionPolicy,
  commit: ReleaseCommit,
  date: string,
): string | undefined {
  const level = levelOf(policy, commit);
  if (level === undefined) return undefined;
  const version = nextVersion(policy.version, level);
  const section = policy.types.find(each => each.type === commit.type)?.section;
  return [
    `## [${version}](${policy.repositoryUrl}/compare/v${policy.version}...v${version}) (${date})`,
    ...(commit.breaking
      ? ['', '### ⚠ BREAKING CHANGES', '', `* ${commit.description}`]
      : []),
    ...(section ? ['', `### ${section}`, '', `* ${commit.description}`] : []),
  ].join('\n');
}
