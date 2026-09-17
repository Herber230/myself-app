import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: import.meta.dirname,
  test: {
    name: '@myself-app/conventions',
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    reporters: ['default'],
    // Assertions about the repository, not logic worth covering: what guards
    // this project is that every scan pins how much it expects to find.
    coverage: {
      provider: 'v8',
      reportsDirectory: './test-output/vitest/coverage',
    },
  },
});
