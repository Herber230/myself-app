import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: import.meta.dirname,
  oxc: { jsx: { runtime: 'automatic' } },
  test: {
    reporters: ['default'],
    // Two environments, one gate, as the app runs them: logic in `node`,
    // components rendered in `jsdom`, each spec beside the file it tests.
    projects: [
      {
        extends: true,
        test: {
          name: '@myself-app/implementation-ui',
          environment: 'node',
          // `*.node.spec.tsx`: JSX rendered as `next build` renders it, with
          // no `document`.
          include: ['src/**/*.spec.ts', 'src/**/*.node.spec.tsx'],
        },
      },
      {
        extends: true,
        test: {
          name: '@myself-app/implementation-ui-dom',
          environment: 'jsdom',
          environmentOptions: { jsdom: { url: 'http://localhost:3000/en/' } },
          include: ['src/**/*.spec.tsx'],
          exclude: ['src/**/*.node.spec.tsx'],
          setupFiles: ['src/test/setup.tsx'],
        },
      },
    ],
    // Gated at 100%, and collected on every run (see the app).
    coverage: {
      provider: 'v8',
      enabled: true,
      all: true,
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.spec.{ts,tsx}',
        // Pure re-export barrels, as entifix excludes its own.
        'src/**/index.ts',
        // What the specs share, not code the package ships.
        'src/test/**',
        // Types only: a module augmentation has nothing to run.
        'src/i18n/typed-keys.ts',
      ],
      reportsDirectory: './test-output/vitest/coverage',
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
});
