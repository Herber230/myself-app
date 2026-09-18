import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: import.meta.dirname,
  test: {
    name: 'myself-app',
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    reporters: ['default'],
    // Gated at 100%, and collected on every run rather than only under CI's
    // `--coverage`: a threshold nothing local enforces is one that breaks in
    // the pull request instead of on the machine that wrote it.
    //
    // `src/**/*.ts` only. The environment is `node`, so a `.tsx` component is
    // never rendered here and counting it would mean a threshold met by
    // excluding what it cannot reach.
    coverage: {
      provider: 'v8',
      enabled: true,
      all: true,
      include: ['src/**/*.ts'],
      // `next/font/local` is a call the Next compiler replaces at build time;
      // outside it the module cannot be imported at all, so there is no run in
      // which this file could be covered.
      exclude: ['src/fonts.ts'],
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
