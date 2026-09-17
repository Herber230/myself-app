import nx from '@nx/eslint-plugin';
import nextConfig from 'eslint-config-next';
import coreWebVitalsConfig from 'eslint-config-next/core-web-vitals';

import baseConfig from '../../eslint.config.mjs';

const config = [
  ...nextConfig,
  ...coreWebVitalsConfig,
  ...baseConfig,
  ...nx.configs['flat/react-typescript'],
  {
    settings: { react: { version: '19.0.0' } },
  },
  {
    ignores: ['.next/**/*', 'out/**/*', '**/out-tsc', 'next-env.d.ts'],
  },
  {
    // Copy lives in the catalogs (`src/i18n/catalogs/`), where both locales
    // are checked for the same keys. A string written into JSX is a string
    // only one locale has. Props are exempt: class names, ids, `lang`.
    files: ['src/**/*.tsx'],
    rules: {
      'react/jsx-no-literals': [
        'error',
        { noStrings: true, ignoreProps: true },
      ],
    },
  },
];

export default config;
