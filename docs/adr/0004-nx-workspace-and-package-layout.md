# 4. An Nx workspace: app, domain, static adapter, content

- Status: Accepted
- Date: 2026-09-17
- Area: platform
- Read when: adding a package or an import between two, or putting an entity class somewhere
- Revised: 2026-09-18 by #21 — the three packages exist, each building to `dist` (ADR 0010)

## Context

entifix entity classes use 2022-03 decorators on `#private` fields, which
Next's compilers cannot build: Turbopack panics and webpack does not parse them.
They must live in a package built by SWC, and that package must be
`sideEffects: true` or a bundler drops `@useCase()` classes nobody imports by
name. So the site is a workspace, not a single app. entifix and r10c are Nx
workspaces on one pinned toolchain.

## Decision

An Nx workspace on entifix's toolchain (Node 26.4, pnpm 11.9, Nx 23,
TypeScript 6), with this layout:

```
apps/myself-app            Next, output: 'export' — the composition root
packages/domain            @entity / @useCase classes (SWC, sideEffects: true)
packages/static-adapter    EntityRepository over static records
packages/content           JSON records
```

Dependencies point one way:

```
app              ──►  domain, content, static-adapter
static-adapter   ──►  @entifix/core, @entifix/business      (never domain)
domain           ──►  @entifix/core, @entifix/business
content          ──►  nothing
```

- **The adapter knows no entity**, so promoting it to entifix is a copy.
- **Content is its own package** and imports nothing: what is true about me is
  kept apart from what shape it has, and a CV edit touches only data.
- Boundaries are enforced by `nx.tags` and `@nx/enforce-module-boundaries`,
  replacing the old app's per-folder `no-restricted-imports` lists (#18).

## Alternatives

- **A plain pnpm workspace** — lighter, but the SWC build, watch mode and
  boundary rules would be hand-wired, and the conventions shared with entifix
  and r10c would be lost.
