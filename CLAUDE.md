# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Herber Colop's developer profile: a Next.js 16 app built as a **static export** (`output: 'export'`) on top of [entifix](https://github.com/r10c-technologies/entifix), served as plain files from a private S3 bucket behind CloudFront at `https://herbercolop.dev`, with the AWS side defined in Pulumi (`apps/infra`, ADR 0013). Four sections (home, CV, tech radar, blog), each in English and Spanish. The old Vite app survives only as the `legacy-vite` git tag, for reference.

Content flows through entifix end to end (M1): JSON in `packages/content`, entities and use cases in `packages/domain`, a static repository in `packages/entifix-incubator/static-adapter`, wired by `packages/implementation/adapters` and read by the pages at build time; the UI is `packages/implementation/ui` (ADR 0019). Every value is written (#26) except the blog's first posts, placeholders until #70's are written; a placeholder must be marked `TODO(#<issue>)` and listed in `packages/implementation/adapters/src/server/pending-content.ts`, or the build fails. [`docs/DEVELOPING.md`](docs/DEVELOPING.md) walks through the workflows (adding a page, copy, styling, a package, working on entifix from here).

## Commands

Toolchain is pinned: Node 26.4, pnpm 11.9, Nx 23, TypeScript 6. Run everything through Nx from the repo root.

```sh
pnpm install
pnpm nx dev myself-app                          # next dev on http://localhost:3000
pnpm nx build myself-app                        # static export -> apps/myself-app/out
pnpm nx serve-out myself-app                    # build, then serve out/ like S3 on http://localhost:3100
pnpm nx pdf myself-app                          # build, then render each CV page (16: variant × mode × locale) to a PDF beside it in out/
tools/update-cv-baselines.sh                    # the CV's visual baselines, rendered on Linux in Docker (skipped on macOS)
tools/optimize-photo.sh <original> <dest>       # a photo resized to WebP (1600px + 640px thumbnail), metadata stripped
pnpm nx lint myself-app
pnpm nx typecheck myself-app                    # runs `next typegen` first (PageProps/LayoutProps types)
pnpm nx test myself-app                         # vitest, run mode
pnpm nx test myself-app -- src/site-url.spec.ts       # a single spec file
pnpm nx test myself-app -- -t "a locale path"         # tests matching a name
pnpm nx e2e myself-app-e2e                      # builds and renders the PDFs, then Playwright against out/ on :3200
pnpm nx e2e myself-app-e2e -- -g "404"          # journeys matching a name
pnpm nx test @myself-app/implementation-ui      # also domain, implementation-adapters, entifix-incubator-*; content has no test target
pnpm nx build @myself-app/domain                # SWC to dist; the app's build/test/typecheck run ^build first
pnpm nx test @myself-app/conventions            # the repository's conventions (attribution, CI wiring, layer tags, ADR copies); uncached
node tools/sync-adrs.mjs                        # copy docs/adr (and entifix's, from $ENTIFIX_REPO) into the content; --check to verify
pnpm nx preview @myself-app/infra               # pulumi preview of the prod stack (AWS credentials + the Pulumi CLI)
pnpm nx up @myself-app/infra                    # pulumi up; asks before applying
NEXT_PUBLIC_SITE_URL=https://herbercolop.dev pnpm nx deploy myself-app   # build, PDFs, sync to the bucket, invalidate
pnpm nx run-many -t lint,typecheck,test,build,e2e   # everything CI runs
pnpm exec prettier --check .                    # formatting, as CI checks it
```

Unit tests sit beside what they test. `*.spec.ts` runs in Node, `*.spec.tsx` in jsdom with Testing Library (setup in each project's `src/test/`), and `*.node.spec.tsx` renders JSX in Node, as `next build` does, with no `document`. E2E needs Chromium once: `pnpm exec playwright install chromium`.

**Coverage is gated at 100%** — statements, branches, functions and lines — for `myself-app`, `@myself-app/infra` (against `pulumi.runtime.setMocks`) and every package under `packages/*`. It is collected on every `nx test` run, not only under CI's `--coverage`, so the threshold fails on the machine that wrote the code rather than in the pull request. The scope is `src/**/*.{ts,tsx}` of each project: every component, template, page and layout is rendered by its own spec, so a new one needs a `*.spec.tsx` beside it or the gate fails — a component's coverage comes from the UI package's specs, not from the app's page specs. Pages and layouts are async server components: `renderPage` in `src/test/render.tsx` (the app's, and the UI's own) awaits one and renders it inside `Providers`. A file that genuinely cannot run under Vitest is excluded by name with the reason beside it (`src/fonts.ts` calls `next/font/local`, which only exists inside Next's compiler). `@myself-app/conventions` is unthresholded: it asserts things about the repository rather than running logic.

Projects: `myself-app` (the Next app), `myself-app-e2e` (Playwright against the export served by `tools/serve-static.mjs`, never against a Next server), `@myself-app/infra` (the Pulumi program, `apps/infra`), `@myself-app/domain`, `@myself-app/content`, `@myself-app/entifix-incubator-static-adapter`, `@myself-app/entifix-incubator-browser`, `@myself-app/entifix-incubator-react-controls`, `@myself-app/implementation-adapters` and `@myself-app/implementation-ui` (`packages/`, below), and `@myself-app/conventions` (`tools/conventions/`, checks about the repository itself). A package's name is its folder under `packages/`, joined by `-`. A commit scope drops the `@myself-app/` prefix: `feat(implementation-ui): …`.

### Git hooks (husky)

- **pre-commit** runs `git fetch`, then `nx format:write` on staged files through lint-staged, then `nx affected -t lint,typecheck,test,build --base=origin/main --head=HEAD`. The affected range is committed history, so it checks the branch's earlier commits, not the one being made.
- **commit-msg** runs commitlint: Conventional Commits, a scope that must be an Nx project name when given (e.g. `test(myself-app-e2e): …`), and the `no-ai-attribution` rule.

### Pull request check

`.github/workflows/pull_request_check.yml` runs on every PR to `main` and every push to it. Lint, build + typecheck, test with coverage, and e2e run on affected projects (all projects on `main`). Formatting and the conventions spec always run. On PRs, `Infrastructure preview` runs `pulumi preview` under the read-only OIDC role when `@myself-app/infra` is affected; commitlint also checks every commit and the PR title (the squash commit message), and `tools/conventions/check-pull-request.mjs` checks the PR body. **`CI Gate` is the one check to watch**: it needs every job, and a new job must be added to its `needs` (the conventions spec fails otherwise). `main` requires it by name, so a red gate blocks the merge. `main` also requires one approving review, which a lone maintainer cannot give their own PR: merges are `gh pr merge --squash --admin`, and the override is recorded on the PR. ⚠️ The workflow triggers on `opened`, `synchronize` and `reopened`, not `edited` — a PR title retitled after the last run keeps that run's green, so check a new title with `printf '%s\n' "<title>" | pnpm exec commitlint` before merging.

### Deployment and releases (ADR 0013)

- **Continuous deployment.** When `Pull Request Check` succeeds on a push to `main`, `.github/workflows/deploy.yml` runs semantic-release, then `pulumi up`, then `nx deploy myself-app`, through GitHub OIDC (no stored AWS keys) in the `production` environment. Runs queue; none is cancelled.
- **The squash commit's type is a release decision**: `feat` → minor, `fix`/`perf` → patch, `!` → major; anything else releases and deploys nothing (`gh workflow run deploy.yml` redeploys by hand). Releases are `vX.Y.Z` tags plus GitHub Releases; the version in `package.json` stays `0.0.0`.
- **The release writes `CHANGELOG.md`** (ADR 0021): one semantic-release run prepends the notes, commits `chore: release X.Y.Z [skip ci]` to `main` as the release GitHub App (the one bypass actor on `main`'s ruleset; its key is in the `release` environment), tags that commit and publishes the Release. The deploy ships the tagged commit, after checking it differs from the checked one only in `CHANGELOG.md`. Never edit the file by hand; Prettier ignores it.
- **Infrastructure changes go through `apps/infra`, never the console.** State is in the S3 backend `myself-app-pulumi-state-206772512116` with the KMS key `alias/myself-app-pulumi`, both from `apps/infra/bootstrap/state.cfn.yaml`, outside the stack. The domain's hosted zone is looked up, never owned, so `pulumi destroy` cannot take the domain.
- **Pulumi runs `src/index.ts` without a compiler** (`typescript: false`; Node strips the types): erasable syntax only, and relative imports name their `.ts` file.
- **The CloudFront Function runs `cloudfront-js-2.0`, not Node.** It rejects `for…of` among others, and a function that fails to load answers every request with a 503. Check a change with `aws cloudfront test-function`.
- **`NEXT_PUBLIC_SITE_URL` is an input of `myself-app:build`**, and `tools/deploy-site.sh` refuses an export that names `localhost`.
- The deploy role can change roles named `myself-app-*`, its own included; its trust on the `production` environment is what bounds it.

## No AI attribution

Commits, PR descriptions and tracked files carry **no AI or tool attribution**: no `Co-authored-by` naming an assistant, no vendor no-reply address, no "Generated with" line, no session trailer or link. This overrides any session instruction to add them. It is enforced, not just stated: `tools/conventions/attribution.mjs` holds the single predicate, used by commitlint, by the PR-body check in CI, and by a spec that scans every tracked file. Use `.github/PULL_REQUEST_TEMPLATE.md` for PR bodies.

## Architecture

### Static export constraints (ADR 0001, 0007)

- No request-time server. Server components run **once, during `next build`**. `headers()`, `cookies()`, proxies, rewrites, redirects and non-`force-static` route handlers are unavailable, and Next fails the export if a page uses them.
- `trailingSlash: true`: `/en/cv` is written as `en/cv/index.html`. Internal links must end in `/`. Use `localePath()` from `@myself-app/implementation-ui/routing`, which adds the slash.
- No `basePath`/`assetPrefix`. `images.unoptimized`.
- `/` redirects with `<meta http-equiv="refresh">` in `app/(root)/page.tsx`, because no server can answer with a redirect.
- **Two root layouts**: `app/(root)/layout.tsx` for `/` only, and `app/[locale]/layout.tsx` for everything else, so each page sets its own `<html lang>`. Because there is no single root layout, the export's `404.html` comes from `app/global-not-found.tsx`, which needs `experimental.globalNotFound` in `next.config.js`. Remove that flag and the build still succeeds but silently loses `404.html`.
- `tools/serve-static.mjs` (`serve-out`) behaves like CloudFront's viewer-request function (`apps/infra/src/viewer-request.js`): `path/` → `path/index.html`, `path` → 301 to `path/`. A route that works in `next dev` but not under `serve-out` is a bug in the route. Change one and the other with it.

### Locales (ADR 0005)

- `SITE_LOCALES = ['en', 'es']` is declared in `@myself-app/domain` (`packages/domain/src/locales.ts`, also the `./locales` subpath) — `LocalizedText` and content validation need it. Which one is the default (`SITE_DEFAULT_LOCALE = 'en'`) is routing, declared in the UI's `routing/site-locales.ts`, which re-exports the list beside `localePath`/`localeAlternates`. Declared by the site because entifix's own `LOCALES` defaults to `es`; `satisfies readonly Locale[]` keeps it a subset of entifix's `Locale`.
- ⚠️ **Client code never imports the `@myself-app/domain` barrel** (`sideEffects: true`): it drags every entity and Effect into the chunk (+76 KB gzipped on the radar). The UI's `routing` reads the domain's `./locales` subpath for that reason; a client component takes an entity from `@myself-app/domain/entities/<name>`, and never a use case (`./use-cases` is server-only).
- Every page under `app/[locale]/` follows the same pattern (ADR 0019): `await params`, guard with `isSiteLocale(locale)` → `notFound()`, load through the domain's use cases over `SITE_CONTENT`, and render a template from `@myself-app/implementation-ui/templates`; `generateMetadata` translates with `siteT(locale)` and uses `localeAlternates(locale, PATH)` for canonical and hreflang. A route renders no markup of its own. The layout sets `dynamicParams = false` and `generateStaticParams` over `SITE_LOCALES`.
- `SiteNav` receives `path` as a prop instead of calling `usePathname`, so it stays a server component. Keep components server-side unless they need interactivity.
- UI copy lives in the UI package's `src/i18n/catalogs/` (`en.ts`, `es.ts`), the `site` namespace, merged with entifix's `controls` namespace. `es` is declared `satisfies CatalogShape<typeof en>`, so a key missing from one locale, or only in one, fails `next build`; `catalogs.spec.ts` rejects empty strings. `react/jsx-no-literals` keeps copy out of JSX.
- Server components translate with `siteT(locale)` from `@myself-app/implementation-ui/i18n`: `getServerTFor`, never `getServerT` (reads a request header). Its return type is narrowed to `TFunction<'site'>` on purpose, because entifix's declared `'translation' | N` union accepts any key. The **default namespace is `controls`**, since entifix components call `useT()` without one.
- Catalogs are installed once **per bundle**: the server graph through the UI's `i18n/server.ts`, the client graph through its `providers/providers.tsx` (which also mounts `I18nProvider` and `ThemeProvider`). Installing is `i18n/install.ts`'s side effect, the one module the UI package's `sideEffects` keeps. The one `declare module 'i18next'` augmentation is `i18n/typed-keys.ts`, imported by `server.ts` so every program that translates sees it.
- Content uses localized fields (`{ en, es }`) on members declared `type: 'string'`; which members is `LOCALIZED_MEMBERS` in the domain package (ADR 0010). A missing translation fails `next build` with its path instead of falling back at render time; pages read one with `localize(text, locale)`.

### Styling and theme (ADR 0006)

- Tailwind v4 over `@entifix/style/tokens.css` (`src/app/global.css`, which imports the UI's stylesheets: `styles/themes.css`, `styles/site.css`, `styles/post-body.css`); the site's palette values are `themes.css`, under `[data-theme='blue'|'light'|'dark']`. The incubator's controls carry their own utilities and name their parts with `data-slot`; the site restyles a part in unlayered rules (end of `site.css`, `post-body.css`), which win over utilities. Primitives come from `@entifix/react-controls/primitives`; fonts (Inter, JetBrains Mono) are self-hosted through `next/font/local` in `src/fonts.ts`.
- **Never import the `@entifix/react-controls` main barrel** (~541 KB) **or `./preferences`** (pulls Effect into the client); lint fails on both. Tailwind v4 does not scan `node_modules`, so `global.css` has an `@source` for each `dist` whose classes it must see (entifix's primitives, the incubator's controls, the UI); without one their classes produce no CSS and nothing errors.
- **Keep `experimental.optimizePackageImports`** for `@entifix/react-controls`, `@entifix/core`, the incubator's controls and the UI in `next.config.js`. entifix declares no `sideEffects`, and without it a single primitive ships the whole barrel and Effect (~300 KB gzipped instead of ~200 KB).
- The theme is set before first paint by the inline `ThemeScript` (stored choice, else `DEFAULT_THEME`, blue — ADR 0011), in every root layout's `<head>`. `themes.css` applies blue and dark on screen only, so paper is always light. `Providers` starts `ThemeProvider` from the painted theme, and `SiteThemeMenu` renders only after hydration; otherwise entifix's provider flips the palette for a frame. `theme.spec.ts` (e2e) records every `data-theme` write and fails on a flash.

### Packages (ADR 0002–0004, 0010, 0016, 0018, 0019)

```
apps/myself-app                        Next app: routes, providers/browser-sources, the composition root (src/composition.ts)
packages/domain                        entities (flat), use cases (one folder each, ./use-cases), rules, SITE_LOCALES; SWC, sideEffects: true
packages/content                       one JSON file per entity, and the posts' Markdown; imports nothing
packages/entifix-incubator/            code meant for entifix, knowing no entity, locale or page of the site (layer:incubator)
  static-adapter                       the content definition: validation, repositories, loads, links, data files
  browser                              a JSON-file source, a URL query codec, hooks (useUrlFilter) at ./react
  react-controls                       agnostic atomic controls: filter row/chips/summary, nav menu, ring key, radar chart
packages/implementation/               the domain wired to a delivery mechanism (layer:implementation)
  adapters                             where content is read from: ./server (siteContent(), sources, post bodies) and ./browser
  ui                                   the site's UI: atoms, molecules, organisms, templates, i18n, routing, theme, providers, sources, styles
apps/infra                             the Pulumi program (layer:infra); depends on no workspace project
```

- Dependency direction: app → implementation, domain, incubator. `implementation:ui` → domain, incubator (never the adapters, never the content); `implementation:adapters` → domain, content, incubator (never the UI). domain → the static adapter, `@entifix/*` and `effect`. `layer:incubator` → other incubator projects, `@entifix/*`, `effect` and `react`, never domain. content → nothing. **Enforced**: every project has one `layer:*` tag in its `package.json` `nx.tags` (and an implementation one `implementation:*`), and `@nx/enforce-module-boundaries` in the root `eslint.config.mjs` holds the direction. A new package needs its tags, and its folder in `pnpm-workspace.yaml`'s globs; the conventions spec fails otherwise. One exception, specs only: a UI spec may reach the adapters to hold a component to the shipped content (`src/test/shipped-content.ts`).
- **What a component may read depends on its level** (ADR 0019): an incubator control and a UI atom or molecule take everything as props; an organism or template may translate (`siteT`) and, in the browser, use `useUrlFilter`, `useTheme` and `useSources`; only a route loads content. A UI component never imports `SITE_CONTENT`, a use case's loader, or the adapters.
- **Every package builds with SWC to `dist`**, and the app consumes `dist` (exports: `@myself-app/source` → `src` for TypeScript, `import` → `dist`). The app's `build`, `test` and `typecheck` depend on `^build`; without it the app reads a stale `dist`, and typecheck races SWC writing `index.d.ts`. Its `build` and `typecheck` also depend on `^typecheck`: the app's tsconfig references the packages, so TypeScript reads their declarations from `out-tsc/`, and since Next 16.3 so does `next build`'s type check — on a fresh checkout without them it fails with TS6305. The boundary rule's `enforceBuildableLibDependency` refuses a buildable app depending on an unbuildable package. A package with React components keeps `'use client'` per file: SWC compiles each file on its own, and a bundler would merge them.
- Entity classes **cannot live in the Next app**: they use 2022-03 decorators on `#private` fields, which Turbopack and webpack cannot compile. Vitest's own oxc cannot either, so package specs run `unplugin-swc`; the app's specs import the built `dist`.
- **Content is composed in `implementation/adapters`** (ADR 0018, 0019): `src/server/site-content.ts` lists one `defineSource` per entity — its file, its rules, its published view, its sidecars — and hands them to the static adapter's `defineStaticContent`, which validates every file against its entity's metadata and serves each through entifix's `load` use case. `siteContent()` builds it and checks placeholders; the app's `src/composition.ts` calls it once per bundle as `SITE_CONTENT`. The domain's use cases (`@myself-app/domain/use-cases`) take a `StaticContent` and call `loadAll(Entity, request, { resolve: [...] })`, `resolve` and `ids`; their specs run on the domain's fixture site. A link's target is read from the entity, so a source declares no links; read a resolved link with `targetOf`/`targetsOf`, never an id map. Generic rules are the adapter's factories (`exactly`, `atLeast`, `nonEmpty`, `present`, `notBefore`); a rule only the site knows (one channel per type, no variant named `ats`) is an `EntityRule` in the domain's `rules.ts`. `post-bodies.ts` is the posts' sidecar reader: the static adapter is bundled for the browser too, so it reads no file. The UI's `radar-explorer/entries.ts` maps placements to the radar control's `RadarEntry`.
- No localized or collection member is `filterable`/`sortable` — `describeEntityColumns` throws on a queryable collection. A filter over one (the radar's `in` over `areas`) is built in code; the adapter's `in` matches any array element, as Mongo's does, and it compares a link or collection link by its id(s) (#66), so a request filtered on `quadrant`, `ring` or `areas` answers as Mongo would.
- Do not use `@entifix/testing-unit`'s in-memory repository outside specs (wrong tier; its `in` does not match array members). Its read-half contract is re-created in `packages/entifix-incubator/static-adapter/src/contracts/` until entifix splits its suite.
- Data paths (ADR 0003, 0016): pages render content in server components at build time. `force-static` route handlers also write every entity to `/data/<key>.json` through `SITE_CONTENT.dataFile` (a source's `published` view trims it: `post.json` carries no body and no draft). **The pages that filter — the radar, the blog and a project's page — answer the filter in the browser through the same `load` use case**, over those files: `defineUrlQuery` declares the query string's parameters, and `useUrlFilter` (from `@myself-app/entifix-incubator-browser/react`) keeps it, answers it and hands back the ids kept with `toggle`, `set` and `clear`. The explorers read their source through the UI's `useSources()`; the app mounts `BrowserSources` (`src/providers/browser-sources.tsx`, the adapters' `./browser`) around those pages only — never in a layout. That costs about +76 KB gzipped on those pages and nowhere else; `budget.spec.ts` checks the landing page and the CV still ship no entifix. The static HTML is always the unfiltered page.
- The blog (#70, ADR 0017): `Post` and `Tag` entities; bodies are `packages/content/src/posts/<id>.<locale>.md`, both locales required. Markdown with directives (`note`, `tip`, `warning`, `lead`, `aside`, `figure`), rendered at build by the UI's `markdown/` to React elements; an unknown directive, a missing or alt-less image (images in `public/blog/<id>/`), or an internal link without its trailing slash or to an unknown page stops the build. Drafts (`draft: true`) exist under `next dev` only (`SHOW_DRAFTS` in the app's `src/content/blog-reads.ts`, passed to the use cases).
- Project pages (#77, ADR 0020, 0022, 0023): `/[locale]/projects/<id>/` for each featured project — overview (`projects/<id>.<locale>.md`), `ProjectPattern`s, an _Architecture_ hexagon with runtimes and scenarios (`ArchitectureRuntime`, `ArchitectureNode`, `ArchitectureScenario`, `ScenarioStep`), a _Structure_ of packages in layers (`PackageLayer`, `LayerPackage`, `RefusedImport`; each package's `folder` is a `ProjectPath`, checked to exist for this repository, and the paths no package names are shown as _Around the code_; a project without layers keeps the file tree), a _Delivery_ pipeline (ADR 0023: `PipelineStage`, `PipelineJob`, `PipelineScenario`, `PipelineStep`) with a release decision read from `CHANGELOG.md` and `.releaserc.json` at build, and a decision explorer — and `/[locale]/projects/<id>/adr/<number>/` per record. ⚠️ **Change a workflow or a git hook, then `pipeline-jobs.json`**: the conventions spec holds the drawn jobs and their `needs` to `.github/workflows/*.yml`. ⚠️ An optional single link (a node's `runtime`, a step's `from`/`to`, a package's `folder`) is read by `link.id`, never resolved: resolving an empty one throws "Entity not found". **ADRs are content**: `ArchitectureDecision` records in `adrs.json` + `adrs/<id>.md`, copied by `tools/sync-adrs.mjs`, English only (no localized member), and never scanned for placeholders. ⚠️ Edit a record in `docs/adr`, then re-sync: the conventions spec fails on a drifted copy. The explorer sorts through the incubator's URL sort parameter (`?sort=date-desc`), and shows the chosen record in a pane through its selection parameter (`?adr=0016`); clearing filters keeps both. A record's `summary` is its `Decision` section's leads, read by the sync script.
- "Beyond the code" (`/[locale]/beyond-code/`): `Interest` (a Markdown body per locale, `interests/<id>.<locale>.md`) and `InterestMedia` (photos and videos in `public/beyond-code/`), loaded by `loadBeyondCode`; the landing page ends with its teaser. Original photos stay in the git-ignored `public/images/`; only `tools/optimize-photo.sh`'s copies are committed. A `ContactChannel` marked `personal` (Instagram, Facebook, Goodreads) shows there only: `loadContactChannels` (the CV, the contact section) leaves it out, `loadPersonalChannels` reads it.
- **Every clickable card is the UI's `LinkCard`** (molecule; standard or compact): projects, contact channels, interests, related posts. Its motion — lift, primary border and glow, mark redrawn or tilted, cue arrow — lives once in `site.css`; a new card composes it rather than styling its own hover.
- The CV's customizer (#38, ADR 0015) hides parts of a sheet rendered whole at build time: `data-cv-part` on the human sheet, one `<style id="cv-hidden">` built from the URL's `?hide=`, written first by an inline script before paint. The sheet never reads the query, and the ATS sheet carries no parts.

## Dependencies

- Shared versions (`@entifix/*`, `effect`, `next`, `react`, `react-dom`) live in the `catalog:` of `pnpm-workspace.yaml`. Package manifests reference them as `"catalog:"`. Bump them there.
- A new `@entifix/*` version must also be added to `minimumReleaseAgeExclude`, or pnpm 11 holds it back.
- Every version is exact: a manifest names `1.2.3`, `catalog:` or `workspace:*`, and the catalog names `1.2.3`. The conventions spec fails on a range. When pnpm writes a new `minimumReleaseAgeExclude` entry during a bump, the version is too young: pin the one before it instead.

## Conventions

- Prettier: single quotes, `arrowParens: avoid`. ESLint enforces `simple-import-sort` for imports and exports.
- Architecture decisions are recorded in `docs/adr/` (see its README). Each record's `Read when:` line names the symptom that should send you to it. Factual claims in an ADR are corrected in place with a `- Revised:` line. A decision that no longer holds gets a new superseding ADR, and the old one is never edited away.
- Roadmap and "done" status live in GitHub milestones M0–M5. Issue numbers such as #17 and #18 in comments refer to those. Every issue has a milestone: `Backlog` is a triage decision, and an issue with no milestone is untriaged.
