# 18. The incubator owns content mechanics; the app declares sources and rules

- Status: Accepted
- Date: 2026-09-27
- Area: data
- Read when: a loader builds an id → record map or casts a link, a new entity needs a source, a content rule is about to be written by hand, a page's filter is about to be wired again, or code is about to move into entifix
- Revised: 2026-09-28 by [ADR 0019](0019-layered-packages-domain-content-incubator-implementation.md) — the sources and the posts' reader are `implementation/adapters`' (`siteContent()`), the loaders are the domain's use cases, and the app keeps its composition root in `src/composition.ts`

Continues [ADR 0016](0016-entifix-queries-run-in-the-browser-too.md), which
opened the incubator layer, and [ADR 0010](0010-content-checked-from-entity-metadata.md),
which checks content from metadata. Nothing a visitor sees changes (#72).

## Context

After #70 the app still did by hand what entifix, or code meant for it, should
do. Every loader that showed a record with its links loaded each target
entity, built an `id → record` map and cast each lookup ("validation has made
it present"): eight maps and about twenty-five casts across `blog.ts`,
`technology-detail.ts`, `radar.ts` and `cv.ts`. A map of repositories was
threaded through every loader, and `loadEvery` padded `pageSize` with
`Number.MAX_SAFE_INTEGER`. `CONTENT_SOURCES` repeated each link's target, which
the entity already declares. Six of eight content rules were generic — exactly
one, at least one, not empty, present, not before — written as site rules. The
browser's view of posts needed an `as unknown as` cast, and the posts' bodies a
reader of their own. The radar and the blog wired the same filter twice.

entifix 0.1.2 has no `include`, `select` or unpaged load on `EntityLoadRequest`,
and its `@accessor` and `@entity` options are closed. It does resolve links —
`EntityLink.resolve`, `EntityCollectionLink.resolve`,
`createEntityLinkResolver` — and a link's target class is on the link
instance (`new Post().tags.entityConstructor`).

## Decision

- **Content is defined once, in the incubator.** `defineStaticContent(content,
sources, options)` in `@myself-app/entifix-incubator-static-adapter` validates every file,
  builds a repository per entity and returns a `StaticContent`: `load` (a
  page), `loadAll` (every record a request keeps), `ids`, the data files, and
  the records it was given. The app hands it `{ entity, file, rules?,
published?, sidecars? }` per entity, through `defineSource`, which types
  each source for its own entity. Loaders take the `StaticContent`, never a
  map of repositories.
- **Link targets come from metadata.** For each `link` and `linkCollection`
  member, the definition reads the target class from a fresh instance and
  finds the source declaring it. A link to an entity with no source is a
  definition error. `links:` is gone from the sources.
- **A load resolves the links it is asked to.** `loadAll(entity, request,
{ resolve: ['tags'] })` resolves those members through entifix's own link
  resolver over the site's repositories (`makeStaticLinkResolver`).
  `targetOf(link)` and `targetsOf(collection)` read a resolved target, and
  throw on one that was not resolved, so no loader casts.
- **Generic rules are factories.** `exactly(n)`, `atLeast(n)`,
  `nonEmpty(member)`, `present(member)` and `notBefore(later, earlier)` sit
  beside `EntityRule`. A rule only this site knows (one channel per type, no
  variant named `ats`) stays in the app.
- **A source's published view is typed.** `published: { request, omit }` is
  checked against the source's entity. The data files — their names from each
  entity's metadata key, their content serialized through the view — are the
  `StaticContent`'s, and the `/data/[file]` route only calls them.
- **A member may come from files beside the records.** `sidecars: { body:
read }` attaches, per record and per locale, what `read(id, locale)`
  returns, before validation, so a missing locale fails with its path. The
  reader is the app's: the static adapter is also bundled for the browser, so
  it touches no file system.
- **The `load` use case runner lives in the static adapter.** Both packages
  need it and `entifix-browser` already depends on `static-adapter`, so
  `loadThroughUseCase` moves down and `entifix-browser` re-exports it.
- **A filter kept in the URL is one hook.** `useUrlFilter(source, query,
context)` in `@myself-app/entifix-incubator-browser/react` reads the state, answers it
  through the use case, keeps the last answer while a new one loads, and
  returns `toggle`, `set`, `clear` and the ids kept. An explorer only lays out
  its controls.

## Consequences

- A loader asks for what it shows and gets it: no id maps, no casts on links.
  What stays in the app is the site's own logic — related posts, a blip's
  movement, a CV's highlights by focus, the Markdown directives.
- A new entity is one `defineSource` line; its links need no declaration.
- `static-adapter` grows from a repository and a validator into the content
  definition. Its tests carry its own fixture entities, as before, so it still
  knows no entity of this site.
- What only entifix can do is filed there, and each incubator piece is the
  consumer that proves it: link resolution through a load request and an
  unpaged load (entifix#38), constraints in metadata (entifix#39), named views
  (entifix#40), the URL filter hook (entifix#41), beside the localized type
  (entifix#36) and collections the in-memory `in` matches (entifix#34). When
  one lands, the incubator piece is deleted and the app changes an import.

## Alternatives considered

- **Wait for entifix.** Every piece is blocked on a release, and the app keeps
  the hand-written copies until then. The incubator exists so that the shape
  is proven here first (ADR 0016).
- **Constraints as a side table in the domain**, as `LOCALIZED_MEMBERS` is.
  Rules already belong to the source that validates them; a second table
  beside the classes is one more list to keep in step.
- **A new package for the static-export glue** (data files, static params).
  It would hold three functions that need the content definition anyway.
