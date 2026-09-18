# 8. A landing page of five static sections

- Status: Accepted
- Date: 2026-09-17
- Area: ui
- Read when: adding or reordering a landing section, or when the in-page nav or the language switch loses its place
- Revised: 2026-09-18 — the script budget is measured and held by an e2e journey

## Context

`/[locale]` is the site's front door: a header, then sections a visitor scrolls
through. Everything it shows — a profile, a handful of projects, contact
channels — is static, so it is path A of
[ADR 0003](0003-build-time-pages-and-browser-queries.md): use cases run in
server components during `next build`, and no entifix, Effect or adapter code
reaches the browser. That record's `Gate` stays untriggered by this page.

What was open was the shape: which sections there are, how a visitor moves
between them without a server to answer for the URL, and which words are content
and which are copy.

## Decision

- **Five sections, in this order: hero, about, projects, entifix, contact.** The
  CV and the tech radar are reached from calls to action in the hero, not from a
  section of their own: they are pages, and a section that only points at a page
  earns less than the scroll it costs.
- **The hero is typography-led, and does not move.** A name, a title, a one-line
  tagline and the two calls to action, set in the site's own type over its
  tokens ([ADR 0006](0006-tailwind-and-entifix-style.md)). The element that
  paints last is text, so nothing is fetched to paint it and there is no
  reduced-motion case to answer.
- **The section nav is anchors first.** It renders as plain links in the
  exported HTML — `localePath(locale, '/')` already ends in a slash, so
  `/en/#projects` is the form — and works with scripting off. Tracking the
  active section is an enhancement: one `'use client'` leaf inside the
  server-rendered `SiteNav`, as `SiteThemeSwitcher` already is. The nav itself
  never becomes a client component.
- **The language switch keeps the section only when scripting is on.** A
  fragment never leaves the browser, and there is no server here to read it if
  it did. A second client leaf appends `location.hash` to the switch's href once
  mounted; without it the visitor arrives at the top of the other locale.
- **Headings are copy, facts are content.** Section headings, nav labels and
  calls to action are catalog keys under a `landing` subtree of the `site`
  namespace; `Profile`, `Project` and `ContactChannel` are records in
  `packages/content` ([ADR 0005](0005-two-locales-and-localized-content.md)).
  ⚠️ The entifix section is the one that looks like content and is not: its
  prose asserts nothing about Herber, answers no query and has no entity. It is
  copy.
- **`Project` carries no image, and `Profile` gains a tagline.** The page as
  decided renders neither a project image nor the bio in the hero, so
  `Project.imageUrl` is dropped from #25's first cut and `Profile.tagline` is
  added beside `bio`. A project's `technologies` link to the radar; the shape of
  that deep link is the radar spec's to choose (#39).
- **One social preview image per locale, generated at build** from
  `app/[locale]/opengraph-image.tsx`, typographic and matching the hero. It runs
  only during the export, so it ships nothing. ⚠️ Open Graph URLs must be
  absolute, and `metadataBase` is `http://localhost:3100` until
  `NEXT_PUBLIC_SITE_URL` is set where the site is deployed
  ([ADR 0007](0007-hosting-deferred-build-host-neutral.md)): the images are
  generated before then, and correct only after.

## Budget

As with ADR 0003's gate, the obligation is recorded here and the numbers are
written back into this record when they are first measured, in #29:

- Lighthouse mobile against `serve-out`, not `next dev`.
- LCP ≤ 1.5 s, CLS < 0.02.
- JavaScript transferred no greater than the placeholder page's baseline plus
  the two client leaves. The only figure measured so far is ADR 0006's ~200 KB
  gzipped on a placeholder page, which is why the budget is a delta over a
  baseline rather than an absolute.

Lighthouse is a manual gate. What CI can hold is cheaper and deterministic: an
e2e journey that sums the bytes of every script the exported landing page
requests, and fails when the total crosses the recorded figure.

### Measured (2026-09-18)

`apps/myself-app-e2e/src/budget.spec.ts` is that journey. It loads `/en/` from
the export, gzips every script response at level 9 and sums them:

| Page   | Scripts | Gzipped  | Budget |
| ------ | ------- | -------- | ------ |
| `/en/` | 11      | 178.6 KB | 194 KB |

The budget is the baseline rounded up, plus 15 KB for the two client leaves,
which don't exist yet. This counts the scripts the page actually loads. ADR
0003's 217.2 KB summed every chunk the HTML references, so the two figures are
different measures, not a regression. A change that crosses the budget either
gets smaller or writes its new figure here, with the reason.

## The sections

```
┌────────────────────────────────────────────┐
│ SiteNav    home · cv · radar    es | theme │  server, + 2 client leaves
├────────────────────────────────────────────┤
│                                            │
│  HERBER COLOP                              │  1 hero          #29
│  Software Engineer                         │  Profile
│  one-line tagline                          │
│                                            │
│  [ CV ]   [ Tech radar ]                   │
│                                            │
├────────────────────────────────────────────┤
│ about · projects · entifix · contact       │  section nav     #29
├────────────────────────────────────────────┤
│  About                                     │  2 about         #32
│  bio, picture                              │  Profile
├────────────────────────────────────────────┤
│  Projects                                  │  3 projects      #30
│  ┌────────┐ ┌────────┐ ┌────────┐          │  Project, featured,
│  │ name   │ │        │ │        │          │  ordered
│  │ summary│ │        │ │        │          │
│  │ ·tech· │ │        │ │        │          │  tech → the radar
│  └────────┘ └────────┘ └────────┘          │
├────────────────────────────────────────────┤
│  Built on entifix                          │  4 entifix       #31
│  what it is · this page runs on it         │  copy, not content
│  repository · npm                          │
├────────────────────────────────────────────┤
│  Contact                                   │  5 contact       #32
│  email · linkedin · github · …             │  ContactChannel, ordered
└────────────────────────────────────────────┘
```

## Alternatives

- **The CV and the radar as a sixth section** — a billboard each, above the
  fold's reach. Rejected: it duplicates the hero's calls to action and the nav,
  and buys a section whose whole content is two links.
- **A client-rendered nav reading `usePathname` and the hash** — the active
  section would be exact rather than observed. Rejected: it makes the site's one
  shared navigation a client component on every page, for an effect that only
  the landing page has, and it leaves nothing in the HTML for a visitor without
  scripting.
