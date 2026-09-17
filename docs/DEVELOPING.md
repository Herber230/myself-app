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

The site is a static export (`output: 'export'`) served as plain files (ADR 0001, 0007). `next dev` is a convenience and does not show you what the bucket will serve:

- **Check a route under `pnpm nx serve-out myself-app`** (http://localhost:3100). `tools/serve-static.mjs` answers the way the S3 website endpoint does. A route that works in `next dev` but not here is a bug in the route.
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

Keep components server-side unless they need interactivity. `SiteNav` takes `path` as a prop for that reason: calling `usePathname` would make it a client component.

## Copy

UI copy lives in `apps/myself-app/src/i18n/catalogs/`, in the `site` namespace (ADR 0005).

- **Add a key to `en.ts` and `es.ts` together.** `es` is declared `satisfies CatalogShape<typeof en>`, so a key missing from it, or only in it, fails `next build`. `catalogs.spec.ts` also rejects empty strings.
- **Translate in server components with `siteT(locale)`**, and never with `getServerT`, which reads a request header. Keys are typed, so `t('cvLeed')` does not compile.
- **Never write copy in JSX.** `react/jsx-no-literals` fails lint on it. Props are exempt.
- The default namespace is entifix's `controls`, because entifix's components call `useT()` without a namespace. The client bundle installs the catalogs through `app/[locale]/providers.tsx`, the server bundle through `i18n/server.ts`.

## Styling

Tailwind v4 over `@entifix/style` tokens (ADR 0006).

- **Style with token utilities** (`bg-surface`, `text-content-muted`, `gap-s`, `text-step-1`) and primitives from `@entifix/react-controls/primitives`.
- **Palette values live in `app/themes.css`**, under `[data-theme='light']` and `[data-theme='dark']`. The site's identity changes there, never in a component.
- **The theme is set before first paint** by `components/theme-script.tsx`: the stored choice if there is one, otherwise `prefers-color-scheme`. The e2e journey in `theme.spec.ts` records every `data-theme` write and fails on a flash.
- ⚠️ **Tailwind does not scan `node_modules`.** `app/global.css` has an `@source` for the primitives' `dist`. Without it their classes produce no CSS and nothing reports it.
- ⚠️ **Never import the `@entifix/react-controls` main barrel or `./preferences`.** Lint fails on both.
- ⚠️ **Keep `optimizePackageImports` in `next.config.js`.** entifix's packages declare no `sideEffects`, and without it one primitive ships the whole barrel and Effect to the browser.

## Boundaries between projects

Every project has exactly one `layer:*` tag in its `package.json` `nx.tags`, and `@nx/enforce-module-boundaries` in the root `eslint.config.mjs` holds the direction of ADR 0004:

```
app              ──►  domain, content, static-adapter
static-adapter   ──►  @entifix/*, effect                   (never domain)
domain           ──►  @entifix/*, effect
content          ──►  nothing
```

When you add a package under `packages/`, give it its tag: `layer:domain`, `layer:static-adapter` or `layer:content`. The conventions spec (`pnpm nx test @myself-app/conventions`) fails on a project without a known `layer:*` tag.

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

## Commits and pull requests

- **Commits:** Conventional Commits, lowercase subject. The scope is an Nx project name when one applies (`build(myself-app): …`). commitlint runs in the `commit-msg` hook.
- **The `pre-commit` hook** formats staged files, then runs `nx affected -t lint,typecheck,test,build` against `origin/main`.
- **Pull request bodies** use `.github/PULL_REQUEST_TEMPLATE.md`. Watch the `CI Gate` check: it needs every other job.
- **No AI or tool attribution** in commits, pull request bodies or tracked files. commitlint, CI and the conventions spec all enforce it through `tools/conventions/attribution.mjs`.
- **Every issue has a milestone.** `Backlog` is a triage decision, and an issue without a milestone is untriaged.
