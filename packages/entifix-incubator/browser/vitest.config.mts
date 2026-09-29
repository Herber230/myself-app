import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: import.meta.dirname,
  // The package knows no entity. Its specs declare fixture entities, and
  // Vite's own oxc does not implement stage-3 decorators.
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
    name: '@myself-app/entifix-incubator-browser',
    // The hooks read `window`; the rest runs there just as well.
    environment: 'jsdom',
    environmentOptions: { jsdom: { url: 'http://localhost/en/list/' } },
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
        'src/index.ts',
        'src/react.ts',
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
