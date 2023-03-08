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
      '@presentation': `${__dirname}/src/presentation`,
      '@utils': `${__dirname}/src/utils`,
    },
  },
});
