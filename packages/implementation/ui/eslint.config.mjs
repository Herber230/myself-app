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
    // A spec builds the markup it drives: its strings are fixtures no visitor
    // reads.
    files: ['src/**/*.spec.tsx', 'src/test/**/*.tsx'],
    plugins: { react },
    rules: {
      'react/jsx-no-literals': 'off',
    },
  },
];
