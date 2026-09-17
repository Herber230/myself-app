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
  },
};

module.exports = nextConfig;
