# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Herber Colop's developer profile: a Next.js 16 app built as a **static export** (`output: 'export'`) on top of [entifix](https://github.com/r10c-technologies/entifix), meant to be served as plain files from S3. Three pages (home, CV, tech radar), each in English and Spanish. The old Vite app survives only as the `legacy-vite` git tag, for reference.

The repo is mid-rebuild. The pages hold placeholder copy for now. `docs/adr/` describes the target layout, and most of it does not exist yet (see "Planned layout" below). Check the file tree before assuming a package is there.

## Commands

Toolchain is pinned: Node 26.4, pnpm 11.9, Nx 23, TypeScript 6. Run everything through Nx from the repo root.

```sh
pnpm install
pnpm nx dev myself-app                          # next dev on http://localhost:3000
pnpm nx build myself-app                        # static export -> apps/myself-app/out
pnpm nx serve-out myself-app                    # build, then serve out/ like S3 on http://localhost:3100
pnpm nx lint myself-app
pnpm nx typecheck myself-app                    # runs `next typegen` first (PageProps/LayoutProps types)
pnpm nx test myself-app                         # vitest, run mode
pnpm nx test myself-app -- src/site-locales.spec.ts   # a single spec file
pnpm nx test myself-app -- -t "a locale path"         # tests matching a name
pnpm nx e2e myself-app-e2e                      # builds, then Playwright against out/ on :3200
pnpm nx e2e myself-app-e2e -- -g "404"          # journeys matching a name
pnpm nx test @myself-app/conventions            # the repository's conventions (attribution, CI wiring)
pnpm nx run-many -t lint,typecheck,test,build,e2e   # everything CI runs
pnpm exec prettier --check .                    # formatting, as CI checks it
```

Unit tests are `src/**/*.spec.ts`, run by Vitest in a Node environment. E2E needs Chromium once: `pnpm exec playwright install chromium`.

Projects: `myself-app` (the Next app), `myself-app-e2e` (Playwright against the export served by `tools/serve-static.mjs`, never against a Next server), and `@myself-app/conventions` (`tools/conventions/`, checks about the repository itself).

### Git hooks (husky)

- **pre-commit** runs `git fetch`, then `nx format:write` on staged files through lint-staged, then `nx affected -t lint,typecheck,test,build --base=origin/main --head=HEAD`. The affected range is committed history, so it checks the branch's earlier commits, not the one being made.
- **commit-msg** runs commitlint: Conventional Commits, a scope that must be an Nx project name when given (e.g. `test(myself-app-e2e): …`), and the `no-ai-attribution` rule.

### Pull request check

`.github/workflows/pull_request_check.yml` runs on every PR to `main` and every push to it. Lint, build + typecheck, test with coverage, and e2e run on affected projects (all projects on `main`). Formatting and the conventions spec always run. On PRs, commitlint also checks every commit and the PR title (the squash commit message), and `tools/conventions/check-pull-request.mjs` checks the PR body. **`CI Gate` is the one check to watch**: it needs every job, and a new job must be added to its `needs` (the conventions spec fails otherwise). The repo is private on a free plan, so no check can be made required.

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

- `src/site-locales.ts` is the single source of truth: `SITE_LOCALES = ['en', 'es']`, default `en`. The list is declared locally because entifix's own `LOCALES` defaults to `es`. `satisfies readonly Locale[]` keeps it a subset of entifix's `Locale`.
- Every page under `app/[locale]/` follows the same pattern: `await params`, guard with `isSiteLocale(locale)` → `notFound()`, and build `generateMetadata` with `localeAlternates(locale, PATH)` for canonical and hreflang. The layout sets `dynamicParams = false` and `generateStaticParams` over `SITE_LOCALES`.
- `SiteNav` receives `path` as a prop instead of calling `usePathname`, so it stays a server component. Keep components server-side unless they need interactivity.
- UI copy currently lives in `src/placeholder-copy.ts`. i18n catalogs are planned to replace it (#17), and a key missing from one locale will then fail the build. Content will use localized fields (`{ en, es }`), and a missing translation fails the build instead of falling back at render time.

### Planned layout (ADR 0002–0004, 0006; not built yet)

```
apps/myself-app            Next app: the composition root
packages/domain            entifix @entity / @useCase classes, built with SWC, sideEffects: true
packages/static-adapter    read-only EntityRepository over static JSON; knows no entity
packages/content           JSON records; imports nothing
```

- Dependency direction: app → domain, content, static-adapter. static-adapter → only `@entifix/*`, never domain. Boundaries will be enforced through `nx.tags` and `@nx/enforce-module-boundaries`. The rule is already on in the root `eslint.config.mjs` with an allow-all constraint, pending #18.
- Entity classes **cannot live in the Next app**: they use 2022-03 decorators on `#private` fields, which Turbopack and webpack cannot compile.
- Do not use `@entifix/testing-unit`'s in-memory repository outside specs (wrong tier; its `in` does not match array members).
- Data paths (ADR 0003): static content runs use cases in server components at build time, so no Effect or entifix code reaches the browser. Interactive parts (radar filtering) query the same adapter in the browser over `/data/<entity>.json`, which `force-static` route handlers emit. The gzipped client cost must be measured before any page depends on that path.
- Styling (ADR 0006): Tailwind v4 with `@entifix/style` tokens, and primitives from `@entifix/react-controls/primitives`. **Never import the `@entifix/react-controls` main barrel** (~541 KB) **or `./preferences`** (pulls Effect into the client). Tailwind v4 does not scan `node_modules`, so the primitives' `dist` needs an explicit `@source`, or their classes produce no CSS without any error.

## Dependencies

- Shared versions (`@entifix/core`, `effect`, `next`, `react`, `react-dom`) live in the `catalog:` of `pnpm-workspace.yaml`. Package manifests reference them as `"catalog:"`. Bump them there.
- A new `@entifix/*` version must also be added to `minimumReleaseAgeExclude`, or pnpm 11 holds it back.
- `@typescript-eslint/*` is pinned through `overrides` to work around a broken upstream publish. Do not remove the pin.

## Conventions

- Prettier: single quotes, `arrowParens: avoid`. ESLint enforces `simple-import-sort` for imports and exports.
- Architecture decisions are recorded in `docs/adr/` (see its README). Each record's `Read when:` line names the symptom that should send you to it. Factual claims in an ADR are corrected in place with a `- Revised:` line. A decision that no longer holds gets a new superseding ADR, and the old one is never edited away.
- Roadmap and "done" status live in GitHub milestones M0–M5. Issue numbers such as #17 and #18 in comments refer to those. Every issue has a milestone: `Backlog` is a triage decision, and an issue with no milestone is untriaged.
