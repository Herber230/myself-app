import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import eslint from 'vite-plugin-eslint';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
    }),
    eslint(),
  ],
  resolve: {
    alias: {
      '@config': `${__dirname}/src/config`,
      '@domain': `${__dirname}/src/domain`,
      '@implementation': `${__dirname}/src/implementation`,
      '@pages': `${__dirname}/src/pages`,
      '@presentation-app': `${__dirname}/src/presentation/app`,
      '@presentation-core': `${__dirname}/src/presentation/core`,
      '@presentation-theming': `${__dirname}/src/presentation/theming`,
      '@utils': `${__dirname}/src/utils`,
    },
  },
});
