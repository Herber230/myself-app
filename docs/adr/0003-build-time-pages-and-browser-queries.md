# 3. Pages render at build; interactive parts query in the browser

- Status: Accepted
- Date: 2026-09-17
- Area: data
- Read when: a component needs data, or a page's client bundle grew

## Context

With no request-time server ([ADR 0001](0001-next-static-export-on-s3.md)),
data can be read in two places: in server components while `next build` runs, or
in the browser after the page loads. Most of the site is static — a profile, a
CV, a list of projects. Some of it is interactive — filtering the tech radar,
tailoring a CV before printing.

## Decision

Two paths, chosen per component:

- **A — build time.** Static content runs entifix use cases in server
  components during `next build`. The HTML carries the data; no entifix, Effect
  or adapter code reaches the browser.
- **C — in the browser.** Interactive parts run the same static adapter in the
  browser, over JSON files the build writes into the export (`/data/<entity>.json`,
  produced by `force-static` route handlers from the same repositories the pages
  read, so the two cannot disagree).

C is where a backend slots in later: its adapter becomes a REST adapter pointed
at the backend, a URL change at the composition root.

## Gate

Before any page depends on C, the gzipped client cost of Effect,
`@entifix/core`, `@entifix/business` and the adapter is measured and written
into this record. If it is not acceptable, interactive parts filter data passed
down as props from build time instead, and this record is revised.

## Alternatives

- **Everything in the browser** — the old app's shape. Ships the runtime and all
  content to every visitor, and search engines see less.
- **Everything at build** — cheapest, but the radar's filtering would not go
  through entifix at all, and the backend path would have no seam.
