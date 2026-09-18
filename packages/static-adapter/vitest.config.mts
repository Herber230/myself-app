import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: import.meta.dirname,
  // The adapter itself needs no decorators — it knows no entity. Its specs do:
  // they declare fixture entities to resolve links between, and Vite's own oxc
  // does not implement stage-3 decorators.
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
    name: '@myself-app/static-adapter',
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
      exclude: [
        // A pure re-export barrel, as entifix excludes its own.
        'src/index.ts',
        // Test material: the contract suite is what the specs run, not code
        // the package ships. It carries no branch a spec could reach except by
        // running it, which is what `static-repository.spec.ts` does.
        'src/contracts/**',
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
