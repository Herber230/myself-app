import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: import.meta.dirname,
  test: {
    name: '@myself-app/implementation-adapters',
    // The server's half reads files; the browser's half is checked with a
    // stubbed `fetch`, which Node has.
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    reporters: ['default'],
    // Gated at 100%, and collected on every run (see the static adapter).
    coverage: {
      provider: 'v8',
      enabled: true,
      all: true,
      include: ['src/**/*.ts'],
      exclude: [
        // Pure re-export barrels, as entifix excludes its own.
        'src/server.ts',
        'src/browser.ts',
        // Test material the specs share, not code the package ships.
        'src/**/*.fixture.ts',
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
