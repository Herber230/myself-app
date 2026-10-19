import nx from '@nx/eslint-plugin';
import react from 'eslint-plugin-react';

import baseConfig from '../../../eslint.config.mjs';

export default [
  ...baseConfig,
  ...nx.configs['flat/react-typescript'],
  {
    settings: { react: { version: '19.0.0' } },
  },
  { ignores: ['**/dist', '**/out-tsc', '**/test-output'] },
  {
    // Copy lives in the catalogs (`src/i18n/catalogs/`), where both locales
    // are checked for the same keys. A string written into JSX is a string
    // only one locale has. Props are exempt: class names, ids, `lang`.
    files: ['src/**/*.tsx'],
    plugins: { react },
    rules: {
      'react/jsx-no-literals': [
        'error',
        { noStrings: true, ignoreProps: true },
      ],
    },
  },
  {
    // A shared page (`src/shared-pages/`) is reached by its link alone, so the
    // site never imports one. `@typescript-eslint/`'s copy of the rule, so the
    // root config's `no-restricted-imports` keeps its own options.
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/shared-pages/**'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/shared-pages', '**/shared-pages/**'],
              message:
                'A shared page is reached by its link alone; the site never imports one.',
            },
          ],
        },
      ],
    },
  },
  {
    // …and a shared page imports nothing of the site, nor entifix: it is
    // React and its own folder, so deleting the folder deletes the page.
    files: ['src/shared-pages/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../../**', '@entifix/*', '@myself-app/*'],
              message:
                'A shared page stands alone: React and the files of its own folder.',
            },
          ],
        },
      ],
    },
  },
  {
    // A spec builds the markup it drives: its strings are fixtures no visitor
    // reads.
    files: ['src/**/*.spec.tsx', 'src/test/**/*.tsx'],
    plugins: { react },
    rules: {
      'react/jsx-no-literals': 'off',
    },
  },
];
