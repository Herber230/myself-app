# 1. A Next static export served from S3

- Status: Accepted
- Date: 2026-09-17
- Area: platform
- Read when: reaching for a server feature — `headers()`, cookies, a proxy, a route handler — or wondering why this is Next rather than Vite

## Context

myself-app was a Vite 4 / React 18 / Emotion single-page application with a
hand-written layering of generic entities, use cases and hardcoded adapters. Its
stack is obsolete, and its generic layer re-implemented what
[entifix](https://github.com/r10c-technologies/entifix) now provides. It is
rebuilt as an entifix consumer, and the previous app is kept as the
`legacy-vite` tag — reference for its domain layer only.

The site is hosted as files in an S3 bucket. There is no request-time server in
this iteration. A backend-for-frontend, with server actions, may come later.

## Decision

**Next.js with `output: 'export'`.** `next build` writes HTML, JavaScript and CSS
into `apps/myself-app/out`, and that directory is the whole deployment.

Server components still run — **once, at build time**, on the machine running
the build. What disappears is request time: `headers()`, `cookies()`, a proxy,
rewrites, redirects, and any route handler other than a `GET` marked
`force-static`. Next fails the export when a page reaches for one, which turns
"this needs a server" into a build error rather than a broken page in the bucket.

## Alternatives

- **Vite** fits a static site equally well today, but a server later would be a
  second rewrite. With Next, removing `output: 'export'` is the migration: pages,
  entities and use cases stay.
- **A true single-page application** would hand every visitor an empty document
  until JavaScript runs. An export ships every route prerendered, which is what
  search engines and link previews read.

## Consequences

- `@entifix/next-i18n`'s `getRequestLocale` is unusable (it reads a request
  header). Locale routing is a real `[locale]` segment; see
  [ADR 0005](0005-two-locales-and-localized-content.md).
- Every dynamic route lists its parameters with `generateStaticParams`.
- Moving to a server later is a new record superseding this one.
