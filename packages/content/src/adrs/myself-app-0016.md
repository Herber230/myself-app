- Revised: 2026-09-27 by [ADR 0018](/projects/myself-app/adr/0018/) — the gaps below are filed as entifix#38–41; `loadThroughUseCase` moved to the static adapter, and a filter is `useUrlFilter`
- Revised: 2026-09-28 by [ADR 0019](/projects/myself-app/adr/0019/) — the incubator's packages live under `packages/entifix-incubator/`, named after it, and its React controls are a package of their own

Decides the browser half of #70. Supersedes the gate of
[ADR 0003](/projects/myself-app/adr/0003/), which measured path C
and rejected it on size, and the filtering half of
[ADR 0014](/projects/myself-app/adr/0014/), which filtered props for that reason.
Pages still render at build (ADR 0003, path A).

## Context

ADR 0003 measured the `load` use case in the browser at +78 KB gzipped on the
radar and kept entifix out of every page. The radar's filter became about 120
hand-written lines — parse the URL, serialize it, match a blip — which did in
the browser what the use case does at build, and a spec to hold the two
together.

Two things changed. The blog (ADR 0017) needs the same filter again, over
posts, tags, technologies and years: a second copy of that code. And the site
exists to show entifix working. A filter that bypasses entifix shows the
opposite, and the priority is now maintainable code over bytes, on the two
pages that filter.

## Decision

- **The same use case answers a page and a filter.**
  `loadThroughUseCase(repository, request)` runs entifix's `load` use case.
  The build calls it over the site's repositories (`SITE_CONTENT.loadAll`). The
  browser calls it over a repository built from `/data/<key>.json`
  (`staticJsonSource`). A filter is an `EntityLoadRequest`, never a matching
  function.
- **The query string declares its parameters.** `defineUrlQuery` names each
  parameter, the values it accepts and the condition it becomes: `anyOf` (an
  `in`, which matches any element of a collection), `containing` (a `like` on
  one locale of a localized text, `title.en`) and `inAnyYear` (a `between` per
  year). URLs stay readable (`?tag=a&tag=b&q=text`), and every value is
  checked against what exists. entifix's own `parseLoadRequestParams` writes
  RSQL and accepts only `filterable` members, which no collection or localized
  member may be (entifix#34, #36).
- **The static HTML stays the unfiltered page.** `useUrlState` reads the query
  after hydration, and `useEntityLoad` is idle while no filter is set. A
  visitor without scripting, and a search engine, get the whole list. While a
  new answer loads, the last one stays on screen.
- **Two filtering rules are Mongo's, in the static adapter**, so a filter
  written here means the same against a real backend: a property may be a
  dotted path into a member (`name.es`), and `like` folds case and accents, as
  an insensitive collation does.
- **An incubator layer holds what is meant for entifix.** `layer:incubator`
  projects know no entity of the site and may depend only on each other,
  `@entifix/*`, `effect` and `react`. Today, under `packages/entifix-incubator/`:
  `@myself-app/entifix-incubator-static-adapter` (entifix#37),
  `@myself-app/entifix-incubator-browser` and
  `@myself-app/entifix-incubator-react-controls`. Moving one into entifix is a
  copy, then a version bump here.
- **Client code imports one entity at a time.** The domain barrel has side
  effects and brings every entity along, so a client component imports from
  `@myself-app/domain/entities/<name>`. The hooks come from
  `@myself-app/entifix-incubator-browser/react`, apart from the barrel, because a server
  component reads through the barrel at build time.

### Measured (2026-09-27, #70)

Every script the page loads, gzipped at level 9 and summed, as ADR 0003
measured (`budget.spec.ts`):

| Page                                      | Props (ADR 0014) | Use case (this) | Change                          |
| ----------------------------------------- | ---------------- | --------------- | ------------------------------- |
| `/en/tech-radar/`                         | 161.2 KB         | 237.4 KB        | **+76.2 KB**                    |
| `/en/tech-radar/`, after the first filter | —                | 241.4 KB        | + the data file                 |
| `/en/blog/` (ADR 0017)                    | —                | 238.0 KB        | 238.8 KB after the first filter |
| `/en/`, `/en/cv/`                         | unchanged        | unchanged       | no entifix shipped              |

The cost is paid on the pages that filter, and nowhere else: `budget.spec.ts`
checks that the landing page and the CV ship no `EntityRepositoryTag`, and
that the radar does.

## Consequences

- The radar's filter is four declared parameters. The blog's is four more.
  Neither has a matching function to keep in step with the build: the spec
  that remains checks that the browser, reading the data file, keeps what the
  build keeps.
- The radar costs about 76 KB more to load. First paint does not change — the
  HTML is the same — but the scripts to parse before the filter works do.
- `/data/<key>.json` is now read. A file that disagrees with its page filters
  the wrong records, which the radar's e2e spec and the parity spec guard.
- The gaps closed here are entifix's to take: seeding
  `@entifix/react-integration`'s `useDataLoading` with a request and an
  answer, filterable collections and localized paths in its RSQL codec,
  `sideEffects` declarations and narrower entry points, and a JSON-file
  repository. Effect 4 (in release candidate) is the largest saving still
  available, and it is entifix's migration to make.

## Alternatives considered

- **Keep filtering props (ADR 0014).** Smallest, and a second copy of the
  same logic for the blog. Rejected for the reason above.
- **`@entifix/react-integration`.** Its `useDataLoading` cannot start from a
  URL or from build-time data, and it requires `@tanstack/react-form` as a
  peer. Left for when entifix closes those gaps.
- **`@entifix/rest`.** Expects an entifix service's envelope, and a static
  host ignores the query string. A static file is not a service.
- **Load entifix only on the first interaction.** Keeps the bytes off the
  first load, at the cost of a loading state and a second code path. Not worth
  it at this size; the first step if a budget is ever at risk.
- **Module Federation.** `@module-federation/nextjs-mf` never supported the App
  Router and is being retired. It solves independent deployment, which this
  site does not have.
