import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: import.meta.dirname,
  // `tsconfig.json`'s `jsx: preserve` is Next's: its compiler takes the JSX
  // as written. Vitest compiles it itself, with React's automatic runtime.
  oxc: { jsx: { runtime: 'automatic' } },
  test: {
    reporters: ['default'],
    // Two environments, one gate: logic in `node`, components rendered in
    // `jsdom`, each spec beside the file it tests.
    projects: [
      {
        extends: true,
        test: {
          name: 'myself-app',
          environment: 'node',
          // `*.node.spec.tsx`: JSX rendered as `next build` renders it, with
          // no `document`.
          include: ['src/**/*.spec.ts', 'src/**/*.node.spec.tsx'],
        },
      },
      {
        extends: true,
        test: {
          name: 'myself-app-dom',
          environment: 'jsdom',
          // An origin, or jsdom has no `localStorage` to give the theme.
          environmentOptions: { jsdom: { url: 'http://localhost:3000/en/' } },
          include: ['src/**/*.spec.tsx'],
          exclude: ['src/**/*.node.spec.tsx'],
          setupFiles: ['src/test/setup.tsx'],
        },
      },
    ],
    // Gated at 100%, and collected on every run rather than only under CI's
    // `--coverage`: a threshold nothing local enforces is one that breaks in
    // the pull request instead of on the machine that wrote it.
    //
    // `.ts` and `.tsx` alike: a component is rendered by its own spec, so a
    // branch in JSX is held to the same line as one in a module.
    coverage: {
      provider: 'v8',
      enabled: true,
      all: true,
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        // `next/font/local` is a call the Next compiler replaces at build
        // time; outside it the module cannot be imported at all, so there is
        // no run in which this file could be covered.
        'src/fonts.ts',
        'src/**/*.spec.{ts,tsx}',
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
