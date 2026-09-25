import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: import.meta.dirname,
  test: {
    name: '@myself-app/infra',
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    reporters: ['default'],
    // Gated at 100% like every project with logic, and collected on every run
    // rather than only under CI's `--coverage`. The program runs against
    // `pulumi.runtime.setMocks`, so no spec touches AWS.
    coverage: {
      provider: 'v8',
      enabled: true,
      all: true,
      include: ['src/**/*.ts'],
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
