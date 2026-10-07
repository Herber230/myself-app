# 22. A project's architecture and layers, drawn from content

- Status: Accepted
- Date: 2026-10-07
- Area: ui
- Read when: a project's Architecture or Structure section shows a part, a line, a step or a package its repository does not have, a scenario lights a line the hexagon does not draw, a package's box has an empty panel, `next build` fails on `architecture-nodes.json`, `scenario-steps.json` or `layer-packages.json`, a project page throws "Entity not found", or someone asks why a project's file tree is gone

## Context

A project's page ([ADR 0020](0020-project-pages-and-adrs-as-content.md))
showed its structure as a file tree: the main folders, each with a note. The
tree said where code lives but not how it is arranged, and the arrangement is
the point of both repositories — entifix is ports and adapters around a
domain, and this site runs the same `load` use case at build and in the
browser ([ADR 0016](0016-entifix-queries-run-in-the-browser-too.md)) over
packages whose import direction lint enforces
([ADR 0019](0019-layered-packages-domain-content-incubator-implementation.md)).

A picture shows that faster than prose, and an interactive one can follow a
request through it. Everything the site shows is content validated against
entities ([ADR 0010](0010-content-checked-from-entity-metadata.md)), in two
locales ([ADR 0005](0005-two-locales-and-localized-content.md)), so the
pictures are too.

## Decision

- **Two sections replace the file tree.** _Architecture_ is a hexagon: the
  domain at the centre, ports around it, adapters outside, a line per
  connection. A switch fades the adapters of the other runtimes (at build or
  in the browser here; in the browser or on a server in entifix), and
  scenarios walk one request through it a step at a time, each step lighting
  its parts and the line it travels, with the line of code that does it.
  _Structure_ is the packages in their layers, an arrow per import allowed,
  and on demand the imports lint refuses, dashed, with why.
- **Both are content.** Seven entities: `ArchitectureRuntime`,
  `ArchitectureNode` (its ring, its angle, its `connects`),
  `ArchitectureScenario` and `ScenarioStep` for the hexagon; `PackageLayer`,
  `LayerPackage` (its column, its `imports`, its `folder`) and
  `RefusedImport` for the layers. Labels are code names and stay as written;
  every sentence is localized. `loadProjectPage` loads them, and a project
  with none keeps its file tree.
- **The folders stay `ProjectPath`s.** A package names its folder, and shows
  that folder's note unless it has its own (`folderOrNote`). _Around the
  code_ is derived: the project's paths no package names (e2e, infra,
  conventions, records). The paths are still checked to exist.
- **An optional link is read by its id.** A node's `runtime`, a step's
  `from`, `to` and `runtime`, and a package's `folder` may be empty, and
  resolving an empty link fails with "Entity not found". Only the
  collections are resolved; a folder is looked up among the page's paths.
- **The drawings are the incubator's**: `HexagonDiagram`, `LayerDiagram` and
  `StepPlayer` know no entity and hold no state but the player's playing. The
  site's `ArchitectureExplorer` and `PackageLayers` keep what is chosen and
  translate at build, as the decision explorer does. On a phone the diagrams
  give way to rows of the same parts and a list of the packages.
- **A code line is real, or says it is an example.** Each is copied from the
  code it names; entifix's scenarios use an `Order` entity and say so.

## Consequences

- A rule sees one file's records, so what crosses files — a step's
  `from → to` is a line the hexagon draws, a refused import is not also
  allowed — is held by a spec over the shipped content, not by validation.
- A part's place is an angle chosen by hand. A new part can overlap another;
  the page has to be looked at, on a wide screen and a narrow one.
- The trigonometry is rounded to two decimals: the server and the browser
  disagree past them, and React refuses the hydrated markup.
- Changing an import rule in `eslint.config.mjs` or entifix's tier register
  means changing `layer-packages.json` and `refused-imports.json` with it;
  nothing checks the drawing against the rule.
