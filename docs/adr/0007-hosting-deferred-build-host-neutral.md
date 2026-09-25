# 7. Hosting is deferred; the build stays host-neutral

- Status: Accepted
- Date: 2026-09-17
- Area: hosting
- Read when: a URL works in `next dev` but not in the export, or when choosing where the site is served from
- Revised: 2026-09-24 by [ADR 0013](0013-cloudfront-over-a-private-bucket-defined-in-pulumi.md) — hosting is decided (CloudFront over a private bucket); `serve-out` now mirrors CloudFront, and a folder without its slash answers a 301

## Context

The site will be served from S3, either through the S3 website endpoint or
through CloudFront in front of a private bucket, and possibly defined as
infrastructure as code. None of that is needed to build the pages, and the
choice is better made when there is something worth publishing (M5).

## Decision

Hosting is decided later. Until then, the export must work unchanged on either
option:

- **`trailingSlash: true`**, so `/en/cv` is written as `en/cv/index.html`.
- **A `404.html`** at the root of the export. The site has two root layouts —
  `(root)` for `/` and `[locale]` for every other page, so that `<html lang>` is
  each page's own — which leaves no single layout to compose a 404 from. It comes
  from `app/global-not-found.tsx`, which in Next 16.2 needs
  `experimental.globalNotFound`. If that flag is removed or renamed, the export
  still builds but loses its `404.html`.
- **Served from the domain root** — no `basePath`, no `assetPrefix`.
- **No redirects or rewrites** in `next.config` (static export ignores them
  anyway).
- **`/` redirects in the page**, with a `<meta http-equiv="refresh">`, since no
  server can answer with a redirect.

Locally, `pnpm nx serve-out myself-app` serves the export with
`tools/serve-static.mjs`, which behaves like the host chosen in
[ADR 0013](0013-cloudfront-over-a-private-bucket-defined-in-pulumi.md): `path/`
answers `path/index.html`, `path` answers a 301 to `path/`, and anything missing
answers `404.html` with status 404.

## Consequences

- A route that works under `next dev` but not under `serve-out` is a bug in the
  route, not in the server.
- The hosting decision gets its own record, from #43: [ADR 0013](0013-cloudfront-over-a-private-bucket-defined-in-pulumi.md).
