import nx from '@nx/eslint-plugin';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

// ---------------------------------------------------------------------------
// Module boundaries (ADR 0004).
//
// Every project carries exactly one `layer:*` tag in its package.json
// `nx.tags`, and `@nx/enforce-module-boundaries` fails lint on an edge pointing
// the wrong way:
//
//   app              ──►  domain, content, incubator
//   incubator        ──►  incubator, @entifix/*, effect, react (never domain)
//   domain           ──►  @entifix/*, effect
//   content          ──►  nothing
//   infra            ──►  @pulumi/*                            (ADR 0013)
//
// The incubator holds what is meant to move into entifix (ADR 0016): the
// static adapter, and the browser's side of a query. Knowing no entity of this
// site is what keeps each of them promotable as a copy; content importing nothing is what keeps it data. A project whose tag
// matches no constraint below cannot depend on anything, and the conventions
// spec fails on a project with no `layer:*` tag at all, which the rule alone
// would only notice once that project imports something.
// ---------------------------------------------------------------------------

const allowEslintConfig = ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'];

/**
 * A library's own external allowance. Nx maps `*` to "anything", so
 * `@entifix/*` covers subpaths too (`@entifix/testing-unit/contracts` in a spec).
 */
const entifixOnly = ['@entifix/*', 'effect', 'effect/*', 'vitest'];

const layerConstraints = [
  {
    sourceTag: 'layer:app',
    onlyDependOnLibsWithTags: [
      'layer:implementation',
      'layer:domain',
      'layer:incubator',
    ],
  },
  {
    // A domain wired to a delivery mechanism (#75): the UI, and the adapters
    // that say where content is read from. Neither imports the other; the app
    // is where they meet.
    sourceTag: 'layer:implementation',
    onlyDependOnLibsWithTags: [
      'layer:domain',
      'layer:content',
      'layer:incubator',
    ],
  },
  {
    sourceTag: 'implementation:adapters',
    notDependOnLibsWithTags: ['implementation:ui'],
  },
  {
    sourceTag: 'implementation:ui',
    notDependOnLibsWithTags: ['implementation:adapters', 'layer:content'],
  },
  {
    sourceTag: 'layer:incubator',
    onlyDependOnLibsWithTags: ['layer:incubator'],
    // React for the hooks; the rest only in their specs.
    allowedExternalImports: [
      ...entifixOnly,
      'react',
      'react-dom/*',
      '@testing-library/*',
    ],
  },
  {
    // The domain reads content through the static adapter's `StaticContent`,
    // the port entifix will own once the incubator moves there (#75).
    sourceTag: 'layer:domain',
    onlyDependOnLibsWithTags: ['layer:incubator'],
    allowedExternalImports: entifixOnly,
  },
  {
    sourceTag: 'layer:content',
    onlyDependOnLibsWithTags: [],
    bannedExternalImports: ['*'],
  },
  {
    // The Pulumi program describes where the site is served from; it reads
    // nothing the site is made of.
    sourceTag: 'layer:infra',
    onlyDependOnLibsWithTags: [],
    allowedExternalImports: ['@pulumi/*', 'vitest', 'node:*'],
  },
  { sourceTag: 'layer:e2e', onlyDependOnLibsWithTags: [] },
  { sourceTag: 'layer:tooling', onlyDependOnLibsWithTags: [] },
];

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: [
      '**/dist',
      // `tsc --build` output. Not ignored here, a `typecheck` run leaves
      // generated `.d.ts` behind that the next `lint` reports errors in.
      '**/out-tsc',
      '**/test-output',
      '**/.next',
      '**/out',
      '**/vite.config.*.timestamp*',
      '**/vitest.config.*.timestamp*',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: allowEslintConfig,
          depConstraints: layerConstraints,
        },
      ],
    },
  },
  {
    // A UI spec may hold a component to the content the site ships, which the
    // adapters build (#75). Specs only: the UI's own code never loads content,
    // the app's pages do. The one edge a spec gets that its file does not, as
    // r10c gives its specs the `type:testing` libraries.
    files: ['**/*.spec.ts', '**/*.spec.tsx', '**/src/test/**/*.ts'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: allowEslintConfig,
          depConstraints: layerConstraints.map(constraint => {
            if (constraint.sourceTag === 'implementation:ui') {
              // The adapters it reaches read the content: that edge is theirs.
              return { ...constraint, notDependOnLibsWithTags: [] };
            }
            if (constraint.sourceTag === 'layer:implementation') {
              return {
                ...constraint,
                onlyDependOnLibsWithTags: [
                  ...constraint.onlyDependOnLibsWithTags,
                  'layer:implementation',
                ],
              };
            }
            return constraint;
          }),
        },
      ],
    },
  },
  {
    settings: {
      react: { version: '19.0.0' },
    },
  },
  {
    // ADR 0006. The main barrel pulls the entity table and query machinery
    // (~541 KB); `./preferences` brings Effect into the browser. Both resolve
    // and build without complaint, so the ban is the only thing that notices.
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.mjs'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@entifix/react-controls',
              message:
                'Import from @entifix/react-controls/primitives (or /i18next). The main barrel is ~541 KB — see docs/adr/0006.',
            },
          ],
          patterns: [
            {
              group: [
                '@entifix/react-controls/preferences',
                '@entifix/react-controls/preferences/*',
              ],
              message:
                '@entifix/react-controls/preferences brings Effect into the browser — see docs/adr/0006.',
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    plugins: { 'simple-import-sort': simpleImportSort },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },
];
