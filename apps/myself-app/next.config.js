//@ts-check

/**
 * A static export (ADR 0001), kept host-neutral until hosting is decided
 * (ADR 0007).
 *
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  output: 'export',
  // `/en/cv` is written as `en/cv/index.html`, which a bucket serves as a folder.
  trailingSlash: true,
  // Image optimization needs a server.
  images: { unoptimized: true },
  experimental: {
    // Two root layouts — `(root)` for `/` and `[locale]` for everything else —
    // leave no single layout to compose a 404 from, so the export's `404.html`
    // comes from `app/global-not-found.tsx`.
    globalNotFound: true,
    // ⚠️ entifix's packages declare no `sideEffects`, so a bundler keeps every
    // module a barrel re-exports. Importing a single `Stack` from
    // `@entifix/react-controls/primitives` then puts every `'use client'`
    // module of that barrel on the page — `ThemeSwitcher` among them, whose
    // `@entifix/core` import brings Effect: ~300 KB of gzipped JavaScript
    // instead of ~200 KB. Rewriting barrel imports to the modules actually
    // used is what keeps a static page's bundle to what it renders (ADR 0006).
    optimizePackageImports: ['@entifix/react-controls', '@entifix/core'],
  },
};

module.exports = nextConfig;
