- Revised: 2026-09-30 — the explorer shows a timeline, then a list beside a reading pane (an accordion on a phone), the chosen record kept in the URL (`?adr=0016`) by a selection parameter that filters nothing; each record carries its key points (`summary`), read by the sync script from its `Decision` section; the page tells how the records are written, found and kept

## Context

The landing page's projects section (#30) showed two cards of chips and
links, and nowhere said how either repository works. What makes these
repositories workable — for a person and for an agent — is less the code than
the decisions around it: every significant one is a record in `docs/adr`,
and each record's `Read when` line names the symptom that should send a
reader to it before the rule it holds is broken. That mechanism is worth
showing, and it lives in two repositories: nineteen records here, four in
entifix.

Everything this site shows is content validated against entities at build
([ADR 0010](/projects/myself-app/adr/0010/)), in two locales
([ADR 0005](/projects/myself-app/adr/0005/)), and a page that
filters answers in the browser through entifix's `load` use case
([ADR 0016](/projects/myself-app/adr/0016/)). The records are
Markdown files in two repositories, written in English, and edited in place
when a fact changes.

## Decision

- **A featured project has a page**, `/[locale]/projects/<id>/`: its
  technologies, an overview, the patterns it is built on, an annotated file
  tree, and its decision records. The landing page's cards lead there, and
  show only a sentence each.
- **Records are content.** `ArchitectureDecision` is an entity (#77);
  `tools/sync-adrs.mjs` copies each repository's `docs/adr` into
  `packages/content/src/adrs.json` and `adrs/<id>.md`. A record's header lines
  become its fields — the status, and what supersedes it, from its `Status`
  line — and its `Revised` lines stay at the top of its body. Links between
  records point at their pages on this site; any other relative link, at the
  file on GitHub.
- **This repository's copies cannot drift.** The conventions spec runs the
  script with `--check`, so a record changed without a re-sync fails CI.
  entifix's copies are synced by hand: CI has no entifix checkout, and the
  script keeps the copies it cannot refresh.
- **Records stay in English.** No member of `ArchitectureDecision` is
  localized; the page around them is translated and says the records are in
  English. Translating them would double the upkeep of documents edited in
  place, and a translated record would drift from its original. This is the
  one exception to ADR 0005's rule that every value exists in both locales.
- **The file tree is written by hand**, one `ProjectPath` per row with a note
  on why it exists; the adapters' spec fails when a row names a path this
  repository does not have.
- **The explorer filters and sorts in the URL.** Status and area are chips,
  the search reads titles and `Read when` lines, and the order is chosen by
  number, date, title or status (`?sort=date-desc`). Sorting chosen in the URL
  is new to the incubator's `defineUrlQuery`: a parameter that filters nothing,
  which clearing the filters keeps. Each record also has a static page,
  `/[locale]/projects/<id>/adr/<number>/`.

## Consequences

- A record is re-synced after it changes: `node tools/sync-adrs.mjs`, with
  entifix beside this checkout (or `ENTIFIX_REPO` pointing at it).
- Copied records are not scanned for placeholders: a record quotes the
  convention when it describes it, and is never written in the content
  package.
- A record's body goes through the posts' Markdown checks
  ([ADR 0017](/projects/myself-app/adr/0017/)): a link the script
  did not rewrite, or a page the site does not have, stops `next build` with
  the record's file.
- A project's page mounts the browser's sources, like the radar and the blog,
  and pays the same scripts for its explorer; the landing page and the CV
  still ship none.
