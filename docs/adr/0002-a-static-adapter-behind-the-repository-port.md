# 2. A static adapter behind entifix's repository port

- Status: Accepted
- Date: 2026-09-17
- Area: data
- Read when: loading content, or tempted to import `@entifix/testing-unit` outside a spec

## Context

Everything the site shows is data that ships with the build: a profile,
employment history, technologies, projects. entifix reads data through
`EntityRepository` (`@entifix/business`) — `get`, `load`, `save`, `delete` — and
a use case asks only for `EntityRepositoryTag`, never for a concrete adapter.

entifix has no production adapter for bundled data. Its only in-memory
repository, `makeInMemoryEntityRepository`, lives in `@entifix/testing-unit`
(tier 5), and entifix's own `example-workspace` calls it a test double used on
purpose. Two defects make it unsuitable beyond that:

- its `in` never matches an array member, where Mongo's `$in` does
  ([entifix#34](https://github.com/r10c-technologies/entifix/issues/34)) — and
  "technologies in any of these areas" is the radar's first query;
- `deserializeSingleEntity` assigns non-relation values raw: it converts no
  dates and checks no `required` member, so nothing validates content on the way
  in.

## Decision

**A read-only static adapter, written in this repository, implementing the
public `EntityRepository` port.** It lives in `packages/static-adapter` and knows
no entity of this site.

- `get` / `load` with the Mongo adapter's filter, sort and paging semantics,
  including array membership for `in` / `nin`.
- `save` / `delete` fail with a typed `EntifixLogicError`.
- Records arrive as JSON and are validated from each entity's metadata before
  they are served; a failure fails `next build`.
- Links resolve through `EntityLinkResolverTag`.

## Alternatives

- **`@entifix/testing-unit` in production** — the wrong tier, and its `in` is
  wrong for the query that matters.
- **A change to entifix first** — slower, and the shape would be a guess.
  Building it against the public port is itself the test that a host can add a
  capability without touching the framework.

## Consequences

- When the shape has held, it is promoted into entifix
  ([entifix#37](https://github.com/r10c-technologies/entifix/issues/37)) and
  this package is replaced by the published one.
- A backend later is a REST adapter under the same tag; nothing above the
  composition root changes.
