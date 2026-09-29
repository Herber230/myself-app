import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: import.meta.dirname,
  oxc: { jsx: { runtime: 'automatic' } },
  test: {
    name: '@myself-app/entifix-incubator-react-controls',
    environment: 'jsdom',
    include: ['src/**/*.spec.ts', 'src/**/*.spec.tsx'],
    setupFiles: ['src/test/setup.ts'],
    reporters: ['default'],
    // Gated at 100%, and collected on every run (see the static adapter).
    coverage: {
      provider: 'v8',
      enabled: true,
      all: true,
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        // Pure re-export barrels, as entifix excludes its own.
        'src/**/index.ts',
        // Test material the specs share, not code the package ships.
        'src/**/*.fixture.ts',
        'src/test/**',
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
