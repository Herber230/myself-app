const config = {
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['./test/setup-tests.ts'],
  testEnvironment: 'jsdom',
  modulePaths: ['<rootDir>/src'],
  transform: {
    '^.+\\.(ts|js|tsx|jsx)$': '@swc/jest',
  },
  transformIgnorePatterns: [
    '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs|cjs|ts|tsx)$',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  moduleNameMapper: {
    '^react-native$': 'react-native-web',
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
    '@config/(.*)': '<rootDir>/src/config/$1',
    '@domain-app/(.*)': '<rootDir>/src/domain/app/$1',
    '@domain-generic/(.*)': '<rootDir>/src/domain/generic/$1',
    '@implementation/(.*)': '<rootDir>/src/implementation/$1',
    '@presentation-app/(.*)': '<rootDir>/src/presentation/app/$1',
    '@presentation-core/(.*)': '<rootDir>/src/presentation/core/$1',
    '@presentation-theming/(.*)': '<rootDir>/src/presentation/theming/$1',
    '@use-cases-app/(.*)': '<rootDir>/src/domain/app/$1',
    '@use-cases-generic/(.*)': '<rootDir>/src/domain/generic/$1',
    '@utils/(.*)': '<rootDir>/src/utils/$1',
  },
  moduleFileExtensions: [
    // Place tsx and ts to beginning as suggestion from Jest team
    // https://jestjs.io/docs/configuration#modulefileextensions-arraystring
    'tsx',
    'ts',
    'web.js',
    'js',
    'web.ts',
    'web.tsx',
    'json',
    'web.jsx',
    'jsx',
    'node',
  ],
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  resetMocks: true,
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.test.json',
    },
  },
  collectCoverage: true,
  coverageProvider: 'v8',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/mocks/**',
  ],
  coveragePathIgnorePatterns: ['index.ts', 'main.tsx', 'main-header.tsx'], // TODO: Complete coverage on main-header.tsx once finished
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  coverageThreshold: {
    global: {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
  },
};

export default config;
