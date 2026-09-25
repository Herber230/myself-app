# Developing

How to work on the site. Commands are listed once, in [`CLAUDE.md`](../CLAUDE.md#commands). The reasons behind the rules are in [`docs/adr/`](adr/).

## Setup

Node 26.4 and pnpm 11.9 are pinned in `engines`. Then:

```sh
pnpm install
pnpm exec playwright install chromium   # once, for e2e
pnpm nx dev myself-app                  # http://localhost:3000
```

Run everything through Nx from the repository root. `pnpm nx run-many -t lint,typecheck,test,build,e2e` runs what CI runs, and `pnpm exec prettier --check .` checks formatting.

## The export is the truth

The site is a static export (`output: 'export'`) served as plain files from a private bucket behind CloudFront (ADR 0001, 0007, 0013). `next dev` is a convenience and does not show you what the site will serve:

- **Check a route under `pnpm nx serve-out myself-app`** (http://localhost:3100). `tools/serve-static.mjs` answers the way CloudFront's viewer-request function does (`apps/infra/src/viewer-request.js`). A route that works in `next dev` but not here is a bug in the route.
- **e2e runs against the export only**, on port 3200, and never against a Next server.
- **Server components run once, at `next build`.** `headers()`, `cookies()`, proxies, rewrites, redirects and non-`force-static` route handlers fail the export.
- **Internal links end in `/`** (`trailingSlash: true`). Build them with `localePath()` from `src/site-locales.ts`.
- **Two root layouts:** `app/(root)/layout.tsx` for `/`, `app/[locale]/layout.tsx` for everything else. With no single root layout, the export's `404.html` comes from `app/global-not-found.tsx` and `experimental.globalNotFound`. Remove the flag and the build still succeeds, but without `404.html`.

## Adding a page

Every page under `app/[locale]/` follows the same steps:

1. `await params`.
2. Guard with `isSiteLocale(locale)` and call `notFound()` if it fails.
3. Get the copy with `siteT(locale)`.
4. Build `generateMetadata` with `localeAlternates(locale, PATH)`.

Keep components server-side unless they need interactivity. `SiteNav` takes `path` as a prop for that reason: calling `usePathname` would make it a client component. When a piece of it does need the browser, it goes in as a `'use client'` leaf — `SiteThemeMenu` is the pattern, and ADR 0008 spends it on the landing page's section tracking.

Every component gets a `*.spec.tsx` beside it. It runs in jsdom with Testing Library, and coverage is gated at 100% over `.tsx` as over `.ts`. Drive the component through what a visitor or a screen reader meets (roles, names, `aria-*`), not its class names. Render a page or layout with `renderPage` from `src/test/render.tsx`, and stub `IntersectionObserver` with `src/test/intersection-observer.ts`. A spec that must see JSX rendered with no `document`, as `next build` renders it, is named `*.node.spec.tsx`.

## Copy

UI copy lives in `apps/myself-app/src/i18n/catalogs/`, in the `site` namespace (ADR 0005).

- **Add a key to `en.ts` and `es.ts` together.** `es` is declared `satisfies CatalogShape<typeof en>`, so a key missing from it, or only in it, fails `next build`. `catalogs.spec.ts` also rejects empty strings.
- **Translate in server components with `siteT(locale)`**, and never with `getServerT`, which reads a request header. Keys are typed, so `t('cvLeed')` does not compile.
- **Never write copy in JSX.** `react/jsx-no-literals` fails lint on it. Props are exempt.
- The default namespace is entifix's `controls`, because entifix's components call `useT()` without a namespace. The client bundle installs the catalogs through `app/[locale]/providers.tsx`, the server bundle through `i18n/server.ts`.

## Content

What the pages say about me lives in `packages/content/src/`, one JSON file per entity (ADR 0004). The shape of each record is its entity in `packages/domain/src/entities/`.

- **Ids are readable slugs** (`next-js`, `adopt`), because they appear in URLs and in the links between files. A link is the id it names: `"ring": "adopt"`, `"areas": ["css"]`.
- **Text that a reader sees is `{ "en": …, "es": … }`**, for the members `LOCALIZED_MEMBERS` lists. A locale missing, empty or not text stops `next build`, with the path: `rings.json › adopt › name is missing "es"`.
- **Every problem is reported at once.** `apps/myself-app/src/content/site-content.ts` validates every file against its entity's metadata before any page renders — required members, dates, enum values, links that point at something — plus the rules only this site has. A new rule is registered there, never in the adapter.
- **A placeholder value carries `TODO(#<issue>)`**, naming the issue that decides it. `apps/myself-app/src/content/pending-content.ts` lists what is left to write, and is empty today: add a path there before shipping a placeholder, and remove it when the value is written, or the build stops.
- Pages read content in server components through `src/content/queries.ts`, which runs entifix's `load` use case over the repositories. No page reads `/data/*.json` in the browser (ADR 0003).

## Styling

Tailwind v4 over `@entifix/style` tokens (ADR 0006).

- **Style with token utilities** (`bg-surface`, `text-content-muted`, `gap-s`, `text-step-1`) and primitives from `@entifix/react-controls/primitives`.
- **Palette values live in `app/themes.css`**, under `[data-theme='light']` and `[data-theme='dark']`. The site's identity changes there, never in a component.
- **The theme is set before first paint** by `components/theme-script.tsx`: the stored choice if there is one, otherwise `DEFAULT_THEME` (blue). Blue and dark apply on screen only, so paper is always light. The e2e journey in `theme.spec.ts` records every `data-theme` write and fails on a flash.
- ⚠️ **Tailwind does not scan `node_modules`.** `app/global.css` has an `@source` for the primitives' `dist`. Without it their classes produce no CSS and nothing reports it.
- ⚠️ **Never import the `@entifix/react-controls` main barrel or `./preferences`.** Lint fails on both.
- ⚠️ **Keep `optimizePackageImports` in `next.config.js`.** entifix's packages declare no `sideEffects`, and without it one primitive ships the whole barrel and Effect to the browser.
- ⚠️ **`max-w-2xl` and its siblings are not Tailwind's container scale here.** entifix's tokens redefine those steps as spacing, so `max-w-2xl` is about 80px. Give a width a length (`max-w-[42rem]`) when you mean one.

## Checking print and PDFs

The CV is judged on paper, so its print output and PDFs are checked as files, not only as pages. None of this is needed to build; it is what inspects the result.

```sh
brew install poppler imagemagick                 # pdfinfo, pdffonts, pdftotext, pdftoppm; magick
pnpm exec playwright install firefox webkit      # print emulation in the other two engines
```

- `pdfinfo <file>` shows the page count, the paper size and the metadata. `pdffonts <file>` shows whether every font is embedded with a Unicode map, which is what keeps text extractable. `pdftotext -layout <file> -` shows what an applicant tracking system reads, in the order it reads it.
- `pdftoppm -r 100 -png -singlefile <file> <name>` renders a page to an image. `magick a.png b.png +append side.png` puts two side by side; `magick compare -metric AE a.png b.png diff.png` counts the pixels that differ.
- **e2e checks every prebuilt PDF** (`cv-pdf.spec.ts`): one page, its metadata, and in its text layer everything its sheet shows, headings in order, and in the ATS mode each contact as a full address. A sheet that grows past one page fails there; cut copy rather than shrinking the type (ADR 0012).
- **The CV's visual baselines** (`cv-visual.spec.ts`) are rendered on Linux, as CI renders them, and skipped elsewhere. After a change to how the CV looks, run `tools/update-cv-baselines.sh` with Docker running: it copies the working tree into Playwright's image, renders every baseline there, and brings back only the snapshot folder. Review the new images before committing them.
- **The Playwright MCP server** in `.mcp.json` drives a headless browser from Claude Code, and can save a page as a PDF. Its version is pinned; bump it on purpose. Approve it the first time `claude` starts in this repository. Its Playwright is its own, so its screenshots are for looking, not for baselines.

## Third-party code

`components/tech-radar/` (`random.ts`, `geometry.ts`, `layout.ts`) is a port of [zalando/tech-radar](https://github.com/zalando/tech-radar)'s maths, MIT licensed. Each file keeps Zalando's copyright notice, which the licence requires of derived work; ADR 0009 says what was ported, what was not, and why. This is unrelated to the no-AI-attribution rule, which is about tool attribution, not authorship of borrowed code.

## Boundaries between projects

Every project has exactly one `layer:*` tag in its `package.json` `nx.tags`, and `@nx/enforce-module-boundaries` in the root `eslint.config.mjs` holds the direction of ADR 0004:

```
app              ──►  domain, content, static-adapter
static-adapter   ──►  @entifix/*, effect                   (never domain)
domain           ──►  @entifix/*, effect
content          ──►  nothing
infra            ──►  @pulumi/*
```

When you add a package under `packages/`, give it its tag: `layer:domain`, `layer:static-adapter` or `layer:content`. The conventions spec (`pnpm nx test @myself-app/conventions`) fails on a project without a known `layer:*` tag.

## Adding a package

The three under `packages/` are the models; copy the one closest to what you need.

- **`package.json`**: `@myself-app/<name>`, `private`, `type: "module"`, one `layer:*` tag in `nx.tags`, and an `exports` map with `"@myself-app/source": "./src/index.ts"` (what TypeScript reads, through `customConditions` in `tsconfig.base.json`) beside `types`/`import` pointing at `dist`. Dependencies shared with the workspace are `"catalog:"`; two copies of `effect` break `Context.Tag` identity without an error.
- **A build**: `.swcrc`, `tsconfig.lib.json` and an `@nx/js:swc` `build` target, as `packages/domain` has. The app is buildable, so the boundary rule refuses an unbuildable dependency. Relative imports name their file with `.js`.
- **A test target**, when the package runs logic: `vitest.config.mts` with the 100% thresholds, `enabled: true`, and `unplugin-swc` if a spec touches an entity. A layer that may not import `vitest` — `content` — has no test target, and is checked by what reads it.
- **The references**: add it to the root `tsconfig.json`, and run `pnpm nx sync` after the app depends on it.
- Then `pnpm nx test @myself-app/conventions` confirms the tag, and `pnpm nx run-many -t lint,typecheck,test,build` the rest.

## Working on entifix from here

To see an unreleased entifix change in this site, run entifix's `dev-sync` from the entifix checkout, pointed at this one:

```sh
# from the entifix checkout; the path is this repository, relative to it
ENTIFIX_CONSUMERS=$PWD/../../portfolio/myself-app pnpm nx run @entifix/source:dev-sync
```

- **It copies, it does not link.** It builds every entifix package, rebuilds on save, and copies what each one publishes into this repository's installed copies under `node_modules/.pnpm`. A running `next dev` picks the change up a few seconds after the save.
- **Manifests and lockfile never change.** The pinned versions stay in the `catalog:` of `pnpm-workspace.yaml`. A synced copy's version reads `<release>-dev.<timestamp>`, and its manifest carries an `entifixDevSync` marker.
- **A new entifix dependency stops the sync**, because a copy cannot install it. Release entifix, bump the catalog, and run `pnpm install`.
- **To put the release back:**

  ```sh
  ENTIFIX_CONSUMERS=$PWD/../../portfolio/myself-app pnpm nx run @entifix/source:dev-sync-reset
  ```

  ⚠️ `pnpm install --force` is not a reset. With the manifests unchanged it reports "Already up to date" and leaves the synced copies in place.

- `ENTIFIX_CONSUMERS` takes several paths, separated by `:`.

When entifix releases, bump its version in the `catalog:` and add the new version to `minimumReleaseAgeExclude`. Otherwise pnpm 11 holds it back.

## Deploying

`herbercolop.dev` is a private S3 bucket behind CloudFront, defined in Pulumi under `apps/infra` (ADR 0013). A new AWS resource goes there, never in the console.

- **Normally you do nothing.** Merging to `main` runs Pull Request Check, and when it passes `deploy.yml` releases, runs `pulumi up` and deploys the site. The pull request's `Infrastructure preview` job showed the plan beforehand.
- **Which merges ship** is decided by the pull request title, which becomes the squash commit: `feat:` → a minor release, `fix:` or `perf:` → a patch, `feat!:` or a `BREAKING CHANGE:` footer → a major. `chore`, `docs`, `ci`, `build`, `test` and `refactor` release and deploy nothing. Run the Deploy workflow by hand (`gh workflow run deploy.yml`) when one of those still needs to go out.
- **Releases** are `vX.Y.Z` tags with generated notes on the GitHub Releases page. That page is the changelog: nothing is committed back to `main`.
- **From your machine**, with AWS credentials for the account (`aws login`) and the Pulumi CLI (`brew install pulumi`):

  ```sh
  pnpm nx preview @myself-app/infra                                     # the plan, read-only
  pnpm nx up @myself-app/infra                                          # asks before applying
  NEXT_PUBLIC_SITE_URL=https://herbercolop.dev pnpm nx deploy myself-app   # build, PDFs, sync, invalidate
  ```

  The deploy refuses an export that still names `localhost`: the origin is baked in at build time.

- **State** lives in `s3://myself-app-pulumi-state-206772512116`, and its secrets are encrypted with `alias/myself-app-pulumi`. Both come from `apps/infra/bootstrap/state.cfn.yaml`, deployed once, outside the stack. `Pulumi.yaml` names the backend, so there is no `pulumi login`.
- **The CloudFront Function is not Node.** `cloudfront-js-2.0` rejects some syntax Node accepts (`for…of`, for one). A function that fails to load answers every request with a 503, so `aws cloudfront test-function` it after changing it.

## Commits and pull requests

- **Commits:** Conventional Commits, lowercase subject. The squash commit's type decides the release (see [Deploying](#deploying)). The scope is an Nx project name when one applies (`build(myself-app): …`). commitlint runs in the `commit-msg` hook.
- **The `pre-commit` hook** formats staged files, then runs `nx affected -t lint,typecheck,test,build` against `origin/main`.
- **Pull request bodies** use `.github/PULL_REQUEST_TEMPLATE.md`. Watch the `CI Gate` check: it needs every other job, and `main` requires it by name, so a red gate blocks the merge.
- **Merging** is a squash, and the pull request title becomes the commit on `main` — so it is linted too. `main` requires one approving review as well, which you cannot give your own pull request: merge with `gh pr merge --squash --admin`, which records the override. ⚠️ Retitling after the last run does not start a new one (the workflow triggers on `opened`, `synchronize`, `reopened`), so a new title keeps the old one's green. Check it first with `printf '%s\n' "<title>" | pnpm exec commitlint`.
- **No AI or tool attribution** in commits, pull request bodies or tracked files. commitlint, CI and the conventions spec all enforce it through `tools/conventions/attribution.mjs`.
- **Every issue has a milestone.** `Backlog` is a triage decision, and an issue without a milestone is untriaged.
