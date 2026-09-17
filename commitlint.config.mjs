import {
  findAttribution,
  formatAttributionFindings,
} from './tools/conventions/attribution.mjs';

/**
 * Conventional commits, with the scope checked against the Nx project names.
 *
 * Everything the presets check is shaped around the subject line — type, scope,
 * case, length — so nothing in them looks at the body or its trailers, which is
 * exactly where AI attribution lands. The rule below does, with the same
 * predicate CI runs over pull-request bodies (`tools/conventions/`).
 */
export default {
  extends: ['@commitlint/config-conventional', '@commitlint/config-nx-scopes'],

  // A local plugin: the rule is one function over the raw message and has no
  // reason to be a published package.
  plugins: [
    {
      rules: {
        'no-ai-attribution': ({ raw }) => {
          const findings = findAttribution(raw ?? '');
          return [
            findings.length === 0,
            formatAttributionFindings(findings, 'This commit message'),
          ];
        },
      },
    },
  ],

  rules: {
    // Level 2 — an error, so the commit is refused rather than annotated.
    'no-ai-attribution': [2, 'always'],
  },
};
