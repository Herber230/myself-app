# 10. Content is checked from entity metadata, and every package ships `dist`

- Status: Accepted
- Date: 2026-09-18
- Area: data
- Read when: a record fails `next build`, a member should be translated, a filter over a list matches nothing, or a package's code reaches the app as source

## Context

[ADR 0002](0002-a-static-adapter-behind-the-repository-port.md) decided on a
static adapter that validates what it serves, and
[ADR 0005](0005-two-locales-and-localized-content.md) on `{ en, es }` objects
riding on `type: 'string'` members. Building them (#21–#25) met five facts that
neither record could know:

- `MetaAccessorOptions` is a closed interface and `MetaAccessorTypes` a closed
  `as const` in `@entifix/core`. An extra key on `@accessor` is a type error,
  and there is no `'localized'` type to declare (entifix#36).
- `describeEntityColumns` throws `EntifixBuildError` when a `linkCollection`,
  `composition` or `scalarCollection` member is `filterable` or `sortable`,
  because a generic comparison would match an array against a scalar.
  `Technology.areas` is exactly that, and "technologies in any of these areas"
  is the radar's first query.
- entifix has no read half of its repository contract to import.
  `describeEntityRepositoryContract` is one suite of seventeen cases, six of
  which write, with no split and no flag.
- Vite's oxc does not implement stage-3 decorators, so a spec that imports an
  entity dies on `@entity(` with "Invalid or unexpected token".
- `@nx/enforce-module-boundaries` runs with `enforceBuildableLibDependency`,
  and the app is buildable: it may only depend on packages that build.

## Decision

- **Validation reads `describeEntityColumns`** — the resolved metadata, every
  default applied — and nothing else about an entity. Required members, dates
  (parsed to `Date`), enum values, scalar types, unique ids and link ids that
  exist are checked from it. Every problem is collected, with its path:
  `employment.json › acme › responsibilities is missing "es"`.
- **Localized members are a list beside the classes** — `LOCALIZED_MEMBERS` in
  `@myself-app/domain` — handed to the adapter with the locales. The adapter
  holds neither: it knows no entity and no locale.
- **Rules the metadata cannot express are registered by the app**: one profile,
  one contact channel per type, no period ending before it starts
  (`apps/myself-app/src/content/site-content.ts`).
- **No localized or collection member is `filterable` or `sortable`.** A filter
  over one is built in code — `in` over `areas` matches any element, as Mongo's
  `$in` does (entifix#34) — and is never parsed from a URL.
- **The read half of the contract is re-created** in
  `packages/static-adapter/src/contracts/`, case for case, against entifix's own
  `ContractWidget`. It is deleted when entifix splits its suite (entifix#37).
- **Every package builds with SWC to `dist`** and the app consumes `dist`: the
  domain for its decorators, the adapter and the content because the app may
  only depend on what builds. Specs run the same decorator transform through
  `unplugin-swc`. The app's `build`, `test` and `typecheck` depend on `^build`.
- **Coverage is gated at 100%** — statements, branches, functions, lines — on
  the app and on every package that runs logic, and is collected on every
  `nx test`, not only in CI. The content package has no test target: its layer
  imports nothing, `vitest` included, and the validation above is what checks
  it, failing `next build` rather than a test run.

## Alternatives

- **Validate with a schema library** — a second description of every entity,
  kept in step with the first by hand. The metadata already says what is
  required and what is a date.
- **Per-locale records** — needs nothing from entifix, but writes every date and
  URL twice (ADR 0005 already rejected it).
- **Consume the packages as source through `transpilePackages`** — no build
  step, but the domain cannot be compiled by Next at all, and the boundary rule
  refuses a buildable app depending on an unbuildable library.

## Consequences

- A record that is wrong stops the export, with every problem listed at once.
- Localized text cannot be searched by the generic query surface; the radar's
  text search reads `en` explicitly.
- When entifix gains a localized type (entifix#36) or splits its contract
  (entifix#37), `LOCALIZED_MEMBERS` and the re-created contract are deletes.
