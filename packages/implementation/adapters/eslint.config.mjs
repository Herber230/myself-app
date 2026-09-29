import baseConfig from '../../../eslint.config.mjs';

export default [
  ...baseConfig,
  { ignores: ['**/dist', '**/out-tsc', '**/test-output'] },
  {
    // The browser's half is bundled into client chunks: it reads no file and
    // never reaches the server's half, which does (#75).
    files: ['src/browser/**/*.ts', 'src/browser.ts'],
    ignores: ['**/*.spec.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@myself-app/domain',
              message:
                'Client code takes an entity from @myself-app/domain/entities/<name>, never the barrel (+76 KB gzipped).',
            },
            {
              name: '@myself-app/content',
              message: 'The browser reads the export, never the content.',
            },
          ],
          patterns: [
            {
              group: ['node:*', '../server/*', './server', '../server'],
              message: 'The browser half reads no file (#75).',
            },
          ],
        },
      ],
    },
  },
];
