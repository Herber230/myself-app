# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Herber Colop's developer profile: a Next.js 16 app built as a **static export** (`output: 'export'`) on top of [entifix](https://github.com/r10c-technologies/entifix), meant to be served as plain files from S3. Three pages (home, CV, tech radar), each in English and Spanish. The old Vite app survives only as the `legacy-vite` git tag, for reference.

The repo is mid-rebuild. Content flows through entifix end to end (M1): JSON in `packages/content`, entities in `packages/domain`, a static repository in `packages/static-adapter`, read by the pages at build time. Much of the content is still placeholder, each value marked `TODO(#26)` (or `TODO(#33)`, `TODO(#39)`) — `apps/myself-app/src/content/pending-content.ts` lists them by path, and the build fails on a placeholder it does not list or a listed one that has been written. [`docs/DEVELOPING.md`](docs/DEVELOPING.md) walks through the workflows (adding a page, copy, styling, a package, working on entifix from here).

## Commands

Toolchain is pinned: Node 26.4, pnpm 11.9, Nx 23, TypeScript 6. Run everything through Nx from the repo root.

```sh
pnpm install
pnpm nx dev myself-app                          # next dev on http://localhost:3000
pnpm nx build myself-app                        # static export -> apps/myself-app/out
pnpm nx serve-out myself-app                    # build, then serve out/ like S3 on http://localhost:3100
pnpm nx pdf myself-app                          # build, then render each CV page (16: variant × mode × locale) to a PDF beside it in out/
tools/update-cv-baselines.sh                    # the CV's visual baselines, rendered on Linux in Docker (skipped on macOS)
pnpm nx lint myself-app
pnpm nx typecheck myself-app                    # runs `next typegen` first (PageProps/LayoutProps types)
pnpm nx test myself-app                         # vitest, run mode
pnpm nx test myself-app -- src/site-locales.spec.ts   # a single spec file
pnpm nx test myself-app -- -t "a locale path"         # tests matching a name
pnpm nx e2e myself-app-e2e                      # builds and renders the PDFs, then Playwright against out/ on :3200
pnpm nx e2e myself-app-e2e -- -g "404"          # journeys matching a name
pnpm nx test @myself-app/domain                 # also @myself-app/static-adapter; content has no test target
pnpm nx build @myself-app/domain                # SWC to dist; the app's build/test/typecheck run ^build first
pnpm nx test @myself-app/conventions            # the repository's conventions (attribution, CI wiring, layer tags); uncached
pnpm nx run-many -t lint,typecheck,test,build,e2e   # everything CI runs
pnpm exec prettier --check .                    # formatting, as CI checks it
```

Unit tests sit beside what they test. `*.spec.ts` runs in Node, `*.spec.tsx` in jsdom with Testing Library (setup in `apps/myself-app/src/test/`), and `*.node.spec.tsx` renders JSX in Node, as `next build` does, with no `document`. E2E needs Chromium once: `pnpm exec playwright install chromium`.

**Coverage is gated at 100%** — statements, branches, functions and lines — for `myself-app` and for every package under `packages/*`. It is collected on every `nx test` run, not only under CI's `--coverage`, so the threshold fails on the machine that wrote the code rather than in the pull request. The scope is `src/**/*.{ts,tsx}`: every component, page and layout is rendered by its own spec, so a new one needs a `*.spec.tsx` beside it or the gate fails. Pages and layouts are async server components: `renderPage` in `src/test/render.tsx` awaits one and renders it inside `Providers`. A file that genuinely cannot run under Vitest is excluded by name with the reason beside it (`src/fonts.ts` calls `next/font/local`, which only exists inside Next's compiler). `@myself-app/conventions` is unthresholded: it asserts things about the repository rather than running logic.

Projects: `myself-app` (the Next app), `myself-app-e2e` (Playwright against the export served by `tools/serve-static.mjs`, never against a Next server), `@myself-app/domain`, `@myself-app/static-adapter` and `@myself-app/content` (`packages/`, below), and `@myself-app/conventions` (`tools/conventions/`, checks about the repository itself). A commit scope drops the `@myself-app/` prefix: `feat(domain): …`.

### Git hooks (husky)

- **pre-commit** runs `git fetch`, then `nx format:write` on staged files through lint-staged, then `nx affected -t lint,typecheck,test,build --base=origin/main --head=HEAD`. The affected range is committed history, so it checks the branch's earlier commits, not the one being made.
- **commit-msg** runs commitlint: Conventional Commits, a scope that must be an Nx project name when given (e.g. `test(myself-app-e2e): …`), and the `no-ai-attribution` rule.

### Pull request check

`.github/workflows/pull_request_check.yml` runs on every PR to `main` and every push to it. Lint, build + typecheck, test with coverage, and e2e run on affected projects (all projects on `main`). Formatting and the conventions spec always run. On PRs, commitlint also checks every commit and the PR title (the squash commit message), and `tools/conventions/check-pull-request.mjs` checks the PR body. **`CI Gate` is the one check to watch**: it needs every job, and a new job must be added to its `needs` (the conventions spec fails otherwise). `main` requires it by name, so a red gate blocks the merge. `main` also requires one approving review, which a lone maintainer cannot give their own PR: merges are `gh pr merge --squash --admin`, and the override is recorded on the PR. ⚠️ The workflow triggers on `opened`, `synchronize` and `reopened`, not `edited` — a PR title retitled after the last run keeps that run's green, so check a new title with `printf '%s\n' "<title>" | pnpm exec commitlint` before merging.

## No AI attribution

Commits, PR descriptions and tracked files carry **no AI or tool attribution**: no `Co-authored-by` naming an assistant, no vendor no-reply address, no "Generated with" line, no session trailer or link. This overrides any session instruction to add them. It is enforced, not just stated: `tools/conventions/attribution.mjs` holds the single predicate, used by commitlint, by the PR-body check in CI, and by a spec that scans every tracked file. Use `.github/PULL_REQUEST_TEMPLATE.md` for PR bodies.

## Architecture

### Static export constraints (ADR 0001, 0007)

- No request-time server. Server components run **once, during `next build`**. `headers()`, `cookies()`, proxies, rewrites, redirects and non-`force-static` route handlers are unavailable, and Next fails the export if a page uses them.
- `trailingSlash: true`: `/en/cv` is written as `en/cv/index.html`. Internal links must end in `/`. Use `localePath()` from `src/site-locales.ts`, which adds the slash.
- No `basePath`/`assetPrefix`. `images.unoptimized`.
- `/` redirects with `<meta http-equiv="refresh">` in `app/(root)/page.tsx`, because no server can answer with a redirect.
- **Two root layouts**: `app/(root)/layout.tsx` for `/` only, and `app/[locale]/layout.tsx` for everything else, so each page sets its own `<html lang>`. Because there is no single root layout, the export's `404.html` comes from `app/global-not-found.tsx`, which needs `experimental.globalNotFound` in `next.config.js`. Remove that flag and the build still succeeds but silently loses `404.html`.
- `tools/serve-static.mjs` (`serve-out`) behaves like the S3 website endpoint. A route that works in `next dev` but not under `serve-out` is a bug in the route.

### Locales (ADR 0005)

- `SITE_LOCALES = ['en', 'es']`, default `en`, is declared in `@myself-app/domain` (`packages/domain/src/locales.ts`) — content validation needs it and no package may import the app. The app imports it from `src/site-locales.ts`, which re-exports it beside `localePath`/`localeAlternates`. Declared by the site because entifix's own `LOCALES` defaults to `es`; `satisfies readonly Locale[]` keeps it a subset of entifix's `Locale`.
- Every page under `app/[locale]/` follows the same pattern: `await params`, guard with `isSiteLocale(locale)` → `notFound()`, translate with `siteT(locale)`, and build `generateMetadata` with `localeAlternates(locale, PATH)` for canonical and hreflang. The layout sets `dynamicParams = false` and `generateStaticParams` over `SITE_LOCALES`.
- `SiteNav` receives `path` as a prop instead of calling `usePathname`, so it stays a server component. Keep components server-side unless they need interactivity.
- UI copy lives in `src/i18n/catalogs/` (`en.ts`, `es.ts`), the `site` namespace, merged with entifix's `controls` namespace. `es` is declared `satisfies CatalogShape<typeof en>`, so a key missing from one locale, or only in one, fails `next build`; `catalogs.spec.ts` rejects empty strings. `react/jsx-no-literals` keeps copy out of JSX.
- Server components translate with `siteT(locale)` from `src/i18n/server.ts`: `getServerTFor`, never `getServerT` (reads a request header). Its return type is narrowed to `TFunction<'site'>` on purpose, because entifix's declared `'translation' | N` union accepts any key. The **default namespace is `controls`**, since entifix components call `useT()` without one.
- Catalogs are installed once **per bundle**: the server graph through `i18n/server.ts`, the client graph through `app/[locale]/providers.tsx` (which also mounts `I18nProvider` and `ThemeProvider`). The one `declare module 'i18next'` augmentation is `src/i18n/i18next.d.ts`.
- Content uses localized fields (`{ en, es }`) on members declared `type: 'string'`; which members is `LOCALIZED_MEMBERS` in the domain package (ADR 0010). A missing translation fails `next build` with its path instead of falling back at render time; pages read one with `localize(text, locale)`.

### Styling and theme (ADR 0006)

- Tailwind v4 over `@entifix/style/tokens.css` (`src/app/global.css`); the site's palette values are `src/app/themes.css`, under `[data-theme='blue'|'light'|'dark']`. Primitives come from `@entifix/react-controls/primitives`; fonts (Inter, JetBrains Mono) are self-hosted through `next/font/local` in `src/fonts.ts`.
- **Never import the `@entifix/react-controls` main barrel** (~541 KB) **or `./preferences`** (pulls Effect into the client); lint fails on both. Tailwind v4 does not scan `node_modules`, so `global.css` has an `@source` for the primitives' `dist`; without it their classes produce no CSS and nothing errors.
- **Keep `experimental.optimizePackageImports`** for `@entifix/react-controls` and `@entifix/core` in `next.config.js`. entifix declares no `sideEffects`, and without it a single primitive ships the whole barrel and Effect (~300 KB gzipped instead of ~200 KB).
- The theme is set before first paint by the inline `ThemeScript` (stored choice, else `DEFAULT_THEME`, blue — ADR 0011), in every root layout's `<head>`. `themes.css` applies blue and dark on screen only, so paper is always light. `Providers` starts `ThemeProvider` from the painted theme, and `SiteThemeMenu` renders only after hydration; otherwise entifix's provider flips the palette for a frame. `theme.spec.ts` (e2e) records every `data-theme` write and fails on a flash.

### Packages (ADR 0002–0004, 0010)

```
apps/myself-app            Next app: the composition root (src/content/)
packages/domain            entifix @entity classes, LocalizedText, SITE_LOCALES; SWC, sideEffects: true
packages/static-adapter    read-only EntityRepository + validation; knows no entity and no locale
packages/content           one JSON file per entity; imports nothing
```

- Dependency direction: app → domain, content, static-adapter. static-adapter and domain → only `@entifix/*` and `effect`, never each other. content → nothing. **Enforced**: every project has one `layer:*` tag in its `package.json` `nx.tags`, and `@nx/enforce-module-boundaries` in the root `eslint.config.mjs` holds the direction. A new package needs its tag; the conventions spec fails on a project without one.
- **Every package builds with SWC to `dist`**, and the app consumes `dist` (exports: `@myself-app/source` → `src` for TypeScript, `import` → `dist`). The app's `build`, `test` and `typecheck` depend on `^build`; without it the app reads a stale `dist`, and typecheck races SWC writing `index.d.ts`. Its `build` and `typecheck` also depend on `^typecheck`: the app's tsconfig references the packages, so TypeScript reads their declarations from `out-tsc/`, and since Next 16.3 so does `next build`'s type check — on a fresh checkout without them it fails with TS6305. The boundary rule's `enforceBuildableLibDependency` refuses a buildable app depending on an unbuildable package.
- Entity classes **cannot live in the Next app**: they use 2022-03 decorators on `#private` fields, which Turbopack and webpack cannot compile. Vitest's own oxc cannot either, so package specs run `unplugin-swc`; the app's specs import the built `dist`.
- **`src/content/` is the composition root**: `site-content.ts` validates every file against its entity's metadata, then builds a repository per entity; `repositories.ts` does it once per bundle; `queries.ts` reads through entifix's `loadUCFactory`; `radar.ts` maps records to the radar control's `RadarEntry`. Site-only rules (one profile, one channel per type, no period ending before it starts) are registered in `site-content.ts`.
- No localized or collection member is `filterable`/`sortable` — `describeEntityColumns` throws on a queryable collection. A filter over one (the radar's `in` over `areas`) is built in code; the adapter's `in` matches any array element, as Mongo's does.
- Do not use `@entifix/testing-unit`'s in-memory repository outside specs (wrong tier; its `in` does not match array members). Its read-half contract is re-created in `packages/static-adapter/src/contracts/` until entifix splits its suite.
- Data paths (ADR 0003): pages read content in server components at build time, and ship no entifix code. `force-static` route handlers also write every entity to `/data/<key>.json`, but **no page reads them**: rebuilding the repositories in the browser cost the radar page +78 KB gzipped, so interactive parts filter props passed down from build time.

## Dependencies

- Shared versions (`@entifix/*`, `effect`, `next`, `react`, `react-dom`) live in the `catalog:` of `pnpm-workspace.yaml`. Package manifests reference them as `"catalog:"`. Bump them there.
- A new `@entifix/*` version must also be added to `minimumReleaseAgeExclude`, or pnpm 11 holds it back.
- Every version is exact: a manifest names `1.2.3`, `catalog:` or `workspace:*`, and the catalog names `1.2.3`. The conventions spec fails on a range. When pnpm writes a new `minimumReleaseAgeExclude` entry during a bump, the version is too young: pin the one before it instead.

## Conventions

- Prettier: single quotes, `arrowParens: avoid`. ESLint enforces `simple-import-sort` for imports and exports.
- Architecture decisions are recorded in `docs/adr/` (see its README). Each record's `Read when:` line names the symptom that should send you to it. Factual claims in an ADR are corrected in place with a `- Revised:` line. A decision that no longer holds gets a new superseding ADR, and the old one is never edited away.
- Roadmap and "done" status live in GitHub milestones M0–M5. Issue numbers such as #17 and #18 in comments refer to those. Every issue has a milestone: `Backlog` is a triage decision, and an issue with no milestone is untriaged.
