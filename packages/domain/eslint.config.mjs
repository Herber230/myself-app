import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  { ignores: ['**/dist', '**/out-tsc', '**/test-output'] },
  {
    // The domain reads content through the static adapter's `StaticContent`
    // (#75). The browser's side of the incubator is the UI's to use.
    files: ['**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@myself-app/entifix-incubator-browser*'],
              message:
                'The domain reads content through the static adapter only (#75).',
            },
          ],
        },
      ],
    },
  },
];
