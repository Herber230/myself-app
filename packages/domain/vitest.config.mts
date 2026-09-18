import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: import.meta.dirname,
  // Vite transforms TypeScript with oxc, which does not implement stage-3
  // decorators — a spec importing an entity dies on `@entity(` with
  // "Invalid or unexpected token". The sources run through SWC instead, with
  // the `decoratorVersion` and `keepClassNames` the package is built with.
  // `swcrc: false` so the transform is defined here and not half in `.swcrc`;
  // helpers are inlined rather than imported, which a test run has no use for.
  plugins: [
    swc.vite({
      swcrc: false,
      configFile: false,
      jsc: {
        target: 'es2022',
        parser: { syntax: 'typescript', decorators: true, dynamicImport: true },
        transform: { decoratorVersion: '2022-03' },
        keepClassNames: true,
        externalHelpers: false,
        loose: true,
      },
      module: { type: 'es6' },
      sourceMaps: true,
    }),
  ],
  test: {
    name: '@myself-app/domain',
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    reporters: ['default'],
    // Gated at 100%, and collected on every run rather than only under CI's
    // `--coverage`: a threshold nothing local enforces is one that breaks in
    // the pull request instead of on the machine that wrote it.
    coverage: {
      provider: 'v8',
      enabled: true,
      all: true,
      include: ['src/**/*.ts'],
      // A pure re-export barrel, as entifix excludes its own. If it ever grows
      // logic, the logic moves out rather than the exception staying.
      exclude: ['src/index.ts'],
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
