Supersedes, in part, [ADR 0018](/projects/myself-app/adr/0018/):
its read half — `StaticContent`'s `load`, `loadAll`, `resolve` and `ids`, the
static link resolver, `loadThroughUseCase` in the static adapter, the URL
filter in the incubator. Continues [ADR 0016](/projects/myself-app/adr/0016/).
Nothing a visitor sees changes.

## Context

The domain's use cases took `StaticContent`, the static adapter's type, so the
domain, the UI (`targetsOf`) and the browser package (`loadThroughUseCase`)
all depended on one implementation of where content comes from. Swapping the
JSON files for another source meant changing the domain.

entifix already owns the ports that make a source swappable: an
`EntityRepository` per entity, the `load` use case over it, and
`createEntityLinkResolver`; it ships REST and Mongo repositories. What the
incubator added on top was generic: an unpaged load, links resolved on many
records, `targetOf`/`targetsOf`, a URL filter, presentational controls. They
moved to entifix (entifix#34, #38, #41): `loadAllUCFactory` and
`resolveLinksUCFactory` in `@entifix/business`, `targetOf`/`targetsOf` in
`@entifix/core`, the URL filter in `@entifix/react-integration/url`, the
controls and `ThemeScript` in `@entifix/react-controls/primitives`, `fill` and
`CatalogShape` in `@entifix/i18n`, and a read half of the repository contract
in `@entifix/testing-unit`.

## Decision

- **The domain reads content through a `ContentReader`.** It declares
  `loadAll(entity, request, { resolve })`, `resolve(records, members)` and
  `ids(entity, request)`, and `makeContentReader(repositories)` builds one
  from an `EntityRepository` per entity, over entifix's `loadAll` and
  `resolveLinks` use cases and its link resolver. Every use case takes a
  `ContentReader`. The domain depends on `@entifix/*` and `effect` only; the
  static adapter is a dev dependency, for its fixture site.
- **The static adapter serves repositories, not reads.** `StaticContent`
  keeps the sources, the validated records, a repository per entity
  (`repositories`, `repositoryOf`) and the data files. Its `load`, `loadAll`,
  `resolve`, `ids`, `loadThroughUseCase`, `resolveLinks` and static link
  resolver are gone.
- **`implementation/adapters` composes the two.** `SiteContent` is the
  domain's reader over the static repositories, plus the records and data
  files only the static files have. Swapping the source is handing
  `makeContentReader` other repositories there.
- **An unpaged load pages.** `loadAllUCFactory` reads page by page until the
  repository's `total`, so a real database is never asked for one page as
  large as can be counted.
- **Every repository is held to entifix's read contract**, array membership
  included, so a filter answers alike over the static files, in the browser
  and over a database.

## Consequences

- A use case names no source. A new source is an `EntityRepository` per
  entity, written once in entifix or here, and passed in the composition.
- The browser's filters run the same `loadAll` use case as the build: the
  specs that hold them together ask it of the domain's reader.
- What stays in the incubator is static by design (`staticJsonSource`, the
  content definition) or waits for its own round in entifix: the static
  adapter itself (entifix#37), metadata constraints and named views
  (entifix#39, #40), the filter controls, the radar and the diagrams.

## Alternatives considered

- **A reader interface in a new incubator package.** It would have been ours
  to keep at 100%, and a port entifix already has.
- **Use cases on entifix's ports directly.** Each would page and resolve on
  its own, in Effect, at every call site; the reader does it once.
- **A type split inside the static adapter.** The domain's manifest would
  still name the static adapter.
