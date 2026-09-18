# 3. Pages render at build; interactive parts query in the browser

- Status: Accepted
- Date: 2026-09-17
- Area: data
- Read when: a component needs data, or a page's client bundle grew
- Revised: 2026-09-18 by #27 — the gate was measured, and C is not used by any page

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

### Measured (2026-09-18, #27)

The JavaScript each exported page loads, gzipped at level 9, summed over every
`/_next/static/**/*.js` its HTML references:

| Page              | Without C | With C   | Change              |
| ----------------- | --------- | -------- | ------------------- |
| `/en/`            | 217.2 KB  | 217.3 KB | —                   |
| `/en/tech-radar/` | 217.2 KB  | 295.6 KB | **+78.3 KB (+36%)** |

"With C" is the radar page carrying one client component that fetched every
`/data/*.json`, rebuilt the repositories, and ran the `load` use case to list
the radar's entries. It worked in Chromium against the export served like the
bucket: twenty entries, from the files alone.

**Not acceptable, so no page uses C.** Seventy-eight kilobytes is what
[ADR 0006](0006-tailwind-and-entifix-style.md) spent its effort removing, and
here it would buy a filter over twenty records whose data is already in the
HTML. Interactive parts — the radar's filter first (#41) — filter props passed
down from build time. Path A pages ship no entifix code: neither the landing
page nor the radar references a chunk that contains `EntityRepositoryTag` or
`loadUCFactory`.

What stays is the seam: `force-static` route handlers still write every entity
to `/data/<key>.json`, from the same repositories and through the same use case
the pages read, and cost the browser nothing. A browser composition over them
was twenty lines, and is the first thing to try again when a page needs more
than props can carry, or when a backend makes the network the source anyway.

## Alternatives

- **Everything in the browser** — the old app's shape. Ships the runtime and all
  content to every visitor, and search engines see less.
- **Everything at build** — cheapest, but the radar's filtering would not go
  through entifix at all, and the backend path would have no seam.
