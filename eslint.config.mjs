import nx from '@nx/eslint-plugin';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

// ---------------------------------------------------------------------------
// Module boundaries (ADR 0004).
//
// Every project carries exactly one `layer:*` tag in its package.json
// `nx.tags`, and `@nx/enforce-module-boundaries` fails lint on an edge pointing
// the wrong way:
//
//   app              ──►  domain, content, static-adapter
//   static-adapter   ──►  @entifix/*, effect                   (never domain)
//   domain           ──►  @entifix/*, effect
//   content          ──►  nothing
//
// The adapter knowing no entity is what keeps it promotable to entifix as a
// copy; content importing nothing is what keeps it data. A project whose tag
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
      'layer:domain',
      'layer:content',
      'layer:static-adapter',
    ],
  },
  {
    sourceTag: 'layer:static-adapter',
    onlyDependOnLibsWithTags: [],
    allowedExternalImports: entifixOnly,
  },
  {
    sourceTag: 'layer:domain',
    onlyDependOnLibsWithTags: [],
    allowedExternalImports: entifixOnly,
  },
  {
    sourceTag: 'layer:content',
    onlyDependOnLibsWithTags: [],
    bannedExternalImports: ['*'],
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
    settings: {
      react: { version: '19.0.0' },
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
