Supersedes, in part, [ADR 0010](/projects/myself-app/adr/0010/)
(a localized member rides on `type: 'string'`, listed in `LOCALIZED_MEMBERS`)
and [ADR 0018](/projects/myself-app/adr/0018/) (the static
adapter's repository, query engine, validation and rule factories, and a
source's `published` view). Continues [ADR 0024](/projects/myself-app/adr/0024/),
whose hand-off it completes. Nothing a visitor sees changes, except that a
theme chosen before is asked for once more.

## Context

The site was on entifix 0.1.3. The incubator held what entifix did not ship
yet: a static repository and its query engine, record validation from the
metadata, rule factories (`exactly`, `atLeast`, `nonEmpty`, `present`,
`notBefore`), a side list of localized members, a per-source `published` view,
date parsing for the browser, and `SplitButton` once entifix had dropped it.

entifix 0.23 ships most of that, much of it copied from here (entifix#36, #37,
#39, #40): `@entifix/static`, core's query engine and `validateRecords`, a
`localized` member type, `cardinality`, `minItems`/`maxItems` and `notBefore`
in the metadata, named views, locales declared by the host, typed failures,
and `@entifix/docs`, its decision records at each release (#88). It also moved
to Effect 4, kept a theme in a cookie, and lowered its dropdowns to a
`--z-dropdown` token.

## Decision

- **The metadata says what a record must hold.** A text per locale is
  `type: 'localized'`; one profile and at least one radar edition are the
  entities' `cardinality`; an end before its start is `notBefore`; a post's
  tags and a variant's focuses are `required` with `minItems: 1`; the
  Markdown bodies are `required`. `LOCALIZED_MEMBERS` and the rule factories
  are deleted. The rules only the site knows stay the domain's, typed as
  core's `EntityRecordRule`.
- **What the browser's copy carries is a view on the entity.** `Post`,
  `Project`, `Interest` and `ArchitectureDecision` declare a `published` view
  that omits their Markdown (and, for posts, keeps no draft). A data file is
  serialized through it; `staticJsonSource` reads it back through
  `staticRepositoryFromRecords`, which validates and parses dates before
  anything is served.
- **The static adapter keeps only composition.** It validates each file with
  core's `validateRecords`, collects every problem into one `InvalidRecords`,
  and serves each entity from `@entifix/static`'s `makeStaticRepository`. What
  stays is what entifix lacks: files composed into one content, links checked
  across files, sidecars, and data files.
- **The site declares its locales.** The domain narrows entifix's `Locale`
  through `LocaleRegister`; the UI passes `SITE_LOCALES` and the English
  default to `defineCatalogs` in every bundle. The site's `localize` keeps no
  fallback, where core's falls back to the default locale.
- **A patch is a pinned, named exception.** `ThemeProvider` copies each choice
  to the UI-preferences port, whose default store imports Effect: every page
  would ship +104 KB gzipped. `patches/@entifix__react-controls@0.23.11.patch`
  keeps the cookie only. It names its exact version, so the next bump fails
  the install until someone decides whether entifix still needs it. A patch
  marking `@entifix/core` side-effect free was measured and dropped: 0.3 KB.
- **The radar and the blog carry entifix's typed failures.** A repository's
  failures are built on Effect's `Schema`, which the static repository raises
  in the browser: +39 KB gzipped on each, written into their budgets in
  `budget.spec.ts`.
- **`SplitButton` lives in the incubator, on `NavMenu`.** entifix deleted it
  for having no adopter (entifix ADR 0026). Rebuilt on entifix's `Menu` it
  cost the CV 33 KB of Headless UI, so it stays a `<details>` that opens with
  scripting off.
- **Stacking follows entifix's z scale.** The header stacks one step above
  `--z-sticky`, where the CV's toolbar and the outline sit, so a panel's
  `--z-dropdown` only orders it within the bar.

## Consequences

- A rule that is a count, a required member, an order of dates or a minimum
  of items is metadata, not a function: `validateRecords` reports it with its
  own wording (`has 2 records, and takes at most 1`).
- The landing page and the CV still ship no entifix and no Effect; the
  budgets hold them to it.
- A theme stored before this change was in `localStorage`; it is now a cookie,
  so a returning visitor sees the default once.
- An entifix bump re-syncs the decision records, and re-decides the patch.
- What could still go upstream: the multi-file composition with sidecars, a
  fetch-backed static source, a `SplitButton` on `NavMenu`, and a
  `ThemeProvider` that leaves the preferences port out when a host keeps none.

## Alternatives considered

- **Port the incubator's code to 0.23 and keep it.** Two copies of one query
  engine and one validator, ours at 100% coverage, diverging with every
  entifix release.
- **Raise every page's budget for Effect.** The landing page and the CV would
  have grown by half for a theme copy the site never reads.
- **A Turbopack alias to a slim core in the browser.** The radar and the blog
  need the real one, and an alias is invisible to the next bump; a pinned
  patch fails loudly.
