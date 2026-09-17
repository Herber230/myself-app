/**
 * The repository's working conventions, asserted rather than stated.
 *
 * The first one is attribution: commits, pull requests and documents carry no
 * AI or tool attribution. entifix and r10c learned that prose cannot hold this
 * rule — it was written down and skipped anyway — so here it starts as a check.
 *
 * Three surfaces are needed because no single one can see everything: a git
 * hook sees a commit message and never a pull-request body, CI sees the body
 * but only after the commit exists, and neither of them looks at what is
 * already committed. So the predicate lives once, in
 * `tools/conventions/attribution.mjs`, and this spec checks both the committed
 * text and that the other surfaces are still wired to that same predicate.
 *
 * Every scan below **pins the number of things it expects to find**, so a check
 * whose file walk quietly stopped finding files fails instead of passing.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

/**
 * Loaded rather than imported: the module is a plain script shared with a git
 * hook, not a typed workspace package.
 */
const attribution = await import(
  join(REPO_ROOT, 'tools', 'conventions', 'attribution.mjs')
);
const {
  ATTRIBUTION_EXEMPT,
  ATTRIBUTION_PATTERNS,
  findAttribution,
  formatAttributionFindings,
  isAttributionExempt,
} = attribution as {
  ATTRIBUTION_EXEMPT: { path: string; reason: string }[];
  ATTRIBUTION_PATTERNS: { id: string; description: string; pattern: RegExp }[];
  findAttribution: (
    text: string,
  ) => { id: string; description: string; match: string; line: number }[];
  formatAttributionFindings: (
    findings: { id: string; match: string; line: number }[],
    subject: string,
  ) => string;
  isAttributionExempt: (path: string) => boolean;
};

/** Extensions worth reading: everything a person writes prose or code into. */
const TEXT_EXTENSIONS = [
  '.md',
  '.ts',
  '.tsx',
  '.mts',
  '.mjs',
  '.js',
  '.cjs',
  '.json',
  '.yml',
  '.yaml',
  '.sh',
  '.css',
];

/** Build output that is occasionally committed by accident; never our prose. */
const GENERATED = ['dist/', 'out-tsc/', 'test-output/', 'node_modules/'];

function trackedTextFiles(): string[] {
  const output = execFileSync('git', ['ls-files', '-z'], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  });
  return (
    output
      .split('\0')
      .filter(Boolean)
      .filter(path => TEXT_EXTENSIONS.some(ext => path.endsWith(ext)))
      .filter(path => !GENERATED.some(prefix => path.includes(prefix)))
      // A staged deletion or an intent-to-add leaves the index and the working
      // tree disagreeing; unfiltered, the read below throws `ENOENT`.
      .filter(path => existsSync(join(REPO_ROOT, path)))
  );
}

/**
 * Real messages, as they landed in entifix and r10c. Written as fragments
 * joined at runtime so this array is a fixture rather than more occurrences of
 * the thing being forbidden.
 */
const REAL_VIOLATIONS: { name: string; text: string }[] = [
  {
    name: "git's own lowercase trailer casing, as committed",
    text: `feat: provision the dashboard\n\nCo-${'authored'}-by: Claude Opus 5 <noreply@anthropic.com>`,
  },
  {
    name: 'the title-cased form documentation writes',
    text: `fix: something\n\nCo-${'Authored'}-By: Claude Opus 5 <noreply@anthropic.com>`,
  },
  {
    name: 'a session trailer',
    text: `feat: x\n\nClaude-${'Session'}: https://claude.ai/code/session_01ABC`,
  },
  {
    name: 'a pull-request body advertisement line',
    text: `## Summary\n\n- did a thing\n\n🤖 Generated with [Claude${' '}Code](https://claude.com/claude-code)`,
  },
  {
    name: 'a bare session link',
    text: `See https://claude.ai/code/session${'_'}01KHP for context.`,
  },
  {
    name: 'a vendor no-reply address on its own',
    text: `Author: someone <noreply@${'anthropic'}.com>`,
  },
];

describe('the attribution predicate', () => {
  it('declares the patterns the surfaces share', () => {
    // Pinned: the surfaces below assert wiring, not coverage, so a pattern
    // silently removed from this list would take its enforcement with it.
    expect(ATTRIBUTION_PATTERNS.length).toBeGreaterThanOrEqual(5);
    for (const { id, description, pattern } of ATTRIBUTION_PATTERNS) {
      expect(id, 'every pattern names what a reader must delete').toMatch(
        /^[a-z][a-z-]+$/,
      );
      expect(description.length).toBeGreaterThan(10);
      expect(
        pattern.flags,
        `${id} must be /g/i — findAttribution reports every occurrence`,
      ).toContain('g');
    }
  });

  it.each(REAL_VIOLATIONS)('catches $name', ({ text }) => {
    expect(findAttribution(text).length).toBeGreaterThan(0);
  });

  it('does not fire on the ways this repository legitimately names the tool', () => {
    const innocent = [
      '# CLAUDE.md',
      'This file provides guidance to Claude Code (claude.ai/code).',
      '# Claude Code local artifacts\n.claude/',
      'See https://claude.com/claude-code for the CLI.',
      '- [ ] No AI attribution in the commits or in this description',
    ];
    for (const text of innocent) {
      expect(findAttribution(text), text).toEqual([]);
    }
  });

  it('reports every occurrence, with the line to delete', () => {
    const text = `subject\n\nbody\n\nCo-${'authored'}-by: Claude Opus 5 <x@y.z>\n`;
    const [finding] = findAttribution(text);
    expect(finding.line).toBe(5);
    expect(finding.id).toBe('co-author-trailer');
  });

  it('resets its cursor between calls', () => {
    // The patterns are module-level and `/g`-flagged: a shared `lastIndex`
    // would make the second call start where the first stopped.
    const text = `x\n\nCo-${'authored'}-by: Claude <a@b.c>\n`;
    expect(findAttribution(text)).toEqual(findAttribution(text));
    expect(findAttribution(text).length).toBe(1);
  });

  it('says nothing when there is nothing to say', () => {
    expect(findAttribution('')).toEqual([]);
    expect(findAttribution(undefined as unknown as string)).toEqual([]);
    expect(formatAttributionFindings([], 'This commit message')).toBe('');
  });

  it('renders a message that says what to remove', () => {
    const rendered = formatAttributionFindings(
      findAttribution(`x\n\nCo-${'authored'}-by: Claude <a@b.c>`),
      'This commit message',
    );
    expect(rendered).toContain('This commit message');
    expect(rendered).toContain('line 3');
    expect(rendered).toContain('co-author-trailer');
  });
});

describe('the exemption list', () => {
  const tracked = trackedTextFiles();

  it('stays short, and every entry is a file the scan can reach', () => {
    // An exemption is a place the rule stops applying, so the count is pinned:
    // adding one has to be a deliberate edit here.
    expect(ATTRIBUTION_EXEMPT.length).toBe(1);

    for (const { path, reason } of ATTRIBUTION_EXEMPT) {
      // An untracked path cannot reach the `git ls-files` walk, so exempting it
      // does nothing — and asserting it exists fails wherever it is not
      // checked out.
      expect(
        tracked.some(file => file === path || file.startsWith(path)),
        `${path} is exempt but matches no tracked file`,
      ).toBe(true);
      expect(
        reason.length,
        `${path} must say why it is exempt`,
      ).toBeGreaterThan(15);
    }
  });

  it('matches on a path prefix, and only forward', () => {
    expect(isAttributionExempt('tools/conventions/attribution.mjs')).toBe(true);
    expect(isAttributionExempt('apps/myself-app/src/site-locales.ts')).toBe(
      false,
    );
  });
});

describe('no committed file carries attribution', () => {
  const files = trackedTextFiles();

  it('reads the repository it means to check', () => {
    // Pinned: if `git ls-files` stops answering, this suite would otherwise
    // pass by checking nothing at all.
    expect(files.length).toBeGreaterThanOrEqual(35);
  });

  it('finds none outside the files that describe the rule', () => {
    const offending: string[] = [];
    for (const file of files) {
      if (isAttributionExempt(file)) continue;
      const findings = findAttribution(
        readFileSync(join(REPO_ROOT, file), 'utf8'),
      );
      for (const finding of findings) {
        offending.push(`${file}:${finding.line}  (${finding.id})`);
      }
    }
    expect(
      offending,
      `attribution in tracked files:\n  ${offending.join('\n  ')}`,
    ).toEqual([]);
  });
});

describe('the enforcement surfaces are wired to that predicate', () => {
  it('commitlint loads it and errors on it', () => {
    // The commit hook is the only surface that stops a violation before it
    // exists. The rule's behaviour is covered by the predicate tests above.
    const config = readFileSync(
      join(REPO_ROOT, 'commitlint.config.mjs'),
      'utf8',
    );
    expect(config).toContain('tools/conventions/attribution.mjs');
    // Level 2 — an error. A warning would print and let the commit through.
    expect(config).toMatch(/'no-ai-attribution':\s*\[2,/);
  });

  it('the commit hook runs commitlint', () => {
    const hook = readFileSync(join(REPO_ROOT, '.husky/commit-msg'), 'utf8');
    expect(hook).toContain('commitlint --edit');
  });

  it('the pull-request template asks for it too', () => {
    const template = readFileSync(
      join(REPO_ROOT, '.github/PULL_REQUEST_TEMPLATE.md'),
      'utf8',
    );
    expect(template.toLowerCase()).toContain('no ai attribution');
  });
});
