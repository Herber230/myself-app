# 19. Layered packages: domain, content, entifix-incubator, implementation

- Status: Accepted
- Date: 2026-09-28
- Area: platform
- Read when: a file is about to be added and it is not obvious which package it belongs in, a component is about to load content or read a site class it does not own, a page's filter needs its data, a boundary lint error names `layer:implementation`, or code is about to move into entifix

Revises [ADR 0004](0004-nx-workspace-and-package-layout.md) (the package
layout), [ADR 0016](0016-entifix-queries-run-in-the-browser-too.md) (the
incubator's names and its React controls) and
[ADR 0018](0018-the-incubator-owns-content-mechanics.md) (where content is
composed). Nothing a visitor sees changes, but for the controls restyled on
entifix's tokens (#75).

## Context

After #74 `packages/` was flat — `domain`, `content`, `static-adapter`,
`entifix-browser` — so the layers were not visible in the tree. The loaders,
which are the site's use cases, lived in the app (`src/content/*.ts`), and every
component sat in `src/components/<page>/`, where a control that knows nothing
of the site (a filter's chips, a navigation dropdown, the radar chart) sat
beside business components and whole pages: `cv-page.tsx` loaded content
itself. The site's stylesheet styled all of them by class, so no control could
leave the app with its looks.

r10c, the reference for how an entifix application is arranged, layers its
packages top to bottom (`apps` › `shells` › `implementation` › `business` ›
`utils`) and keeps every entity-agnostic component in `@entifix/react-controls`
in atomic layers (`ui/atoms`, `molecules`, `layout`, `organisms`), with the
contexts (theme, i18n, preferences) beside them rather than inside. It has
shells because it has many apps; this site has one.

## Decision

**Packages are grouped by layer, and named from their folders.**

```
packages/
├── domain/                      @myself-app/domain                            layer:domain
├── content/                     @myself-app/content                           layer:content
├── entifix-incubator/                                                         layer:incubator
│   ├── static-adapter/          @myself-app/entifix-incubator-static-adapter
│   ├── browser/                 @myself-app/entifix-incubator-browser
│   └── react-controls/          @myself-app/entifix-incubator-react-controls
└── implementation/                                                            layer:implementation
    ├── adapters/                @myself-app/implementation-adapters           implementation:adapters
    └── ui/                      @myself-app/implementation-ui                 implementation:ui
```

The direction, held by `@nx/enforce-module-boundaries`:

```
app                     → implementation, domain, incubator
implementation:ui       → domain, incubator                 (never the adapters, never the content)
implementation:adapters → domain, content, incubator        (never the ui)
domain                  → incubator (the static adapter), @entifix/*, effect
incubator               → incubator, @entifix/*, effect, react
content                 → nothing
```

**The domain holds the business: entities, use cases, rules.** `entities/` is
flat. Each use case is a folder — `<name>.uc.ts`, its spec, an `index.ts`, and a
`<name>.types.ts` where the UI reads its types — served by a `./use-cases`
subpath, apart from the barrel. The site-only content rules are `rules.ts`.
Use cases read content through the static adapter's `StaticContent`: that is
the port, and entifix will own it once the incubator moves there, so the domain
declares none of its own. Their specs run on a small fixture site, never the
real content. `Project` belongs to the `profile` domain: the landing page is a
page, not a business area. The published locales stay in the domain
(`LocalizedText` and the rule that no translation is missing are the
content's); which one is the default is routing, and lives with the UI.

**The implementation layer wires the domain to a delivery mechanism, in two
kinds that never import each other.** `adapters` says where content is read
from: on the server (`./server`), the static adapter over the content package,
the posts' bodies and the placeholder check, built by `siteContent()`; in the
browser (`./browser`), the export's data files. `ui` renders: atoms,
molecules, organisms and templates, one folder per component, beside the copy
(`i18n`: the catalogs and `siteT`), the routes (`routing`), the theme, the
providers, the posts' Markdown, the feed, the social image and the site's
stylesheets (`styles/*`). The app is where the two meet.

**What a component may reach depends on its level.**

| Where                              | Knows the business? | Reads from context                                                                     |
| ---------------------------------- | ------------------- | -------------------------------------------------------------------------------------- |
| `entifix-incubator/react-controls` | no                  | nothing: copy, links and data arrive as props; its behaviours read the DOM             |
| `ui` atoms, molecules              | yes, as props       | nothing                                                                                |
| `ui` organisms, templates          | yes                 | `siteT(locale)` on the server; `useUrlFilter`, `useTheme`, `useSources` in the browser |
| app routes                         | yes                 | the only place that loads: `SITE_CONTENT` and the use cases                            |

So the UI never loads content, and a route never renders markup beyond a
template: it checks its params, loads, and hands the template what it read.

**A filter's data arrives through a context.** The UI declares
`BrowserSources` and `useSources()`; the app mounts `SourcesProvider` with the
adapters' `browserSources` around the radar's and the blog's pages only. A
server page cannot hand a client component a function, and a provider in the
layout would put entifix-browser and Effect on every page, which
`budget.spec.ts` forbids for the landing page and the CV.

**The incubator's controls style themselves.** Each carries utilities over
entifix's tokens rather than the site's classes, and names its parts with
`data-slot`. A site variant — the phone's menu sheet, the blog's sidebar
filter — restyles a part in an unlayered rule, which wins over the controls'
utilities. The radar knows no site locale and no path: it takes where a blip
links, and the layout the locale to number by.

**A UI spec may hold a component to the content the site ships.** Its specs,
and only its specs, may import the adapters (`src/test/shipped-content.ts`), as
r10c's specs may import its `type:testing` libraries. The UI's own code cannot.

## Consequences

- Seven projects where there were four, each with its SWC build, its coverage
  gate at 100% and its `layer:*` tag; `layer:implementation` projects also
  carry one `implementation:*`, which the conventions spec checks.
- `pnpm-workspace.yaml` lists the layer folders, and the conventions spec reads
  its projects from those globs.
- The UI package is `sideEffects: false` but for `i18n/install`, whose import
  is what installs the catalogs. `next.config.js` optimizes its imports and the
  incubator controls', and `global.css` has an `@source` for each `dist`:
  without it their classes produce no CSS, and nothing errors.
- The typed-key gate is `ui/src/i18n/typed-keys.ts`, imported by `siteT`'s
  module, so every program that translates sees it.
- Moving a package into entifix stays a copy: the incubator's three know no
  entity, no locale and no page of this site.
