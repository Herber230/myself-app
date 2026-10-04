- Revised: 2026-09-17 by #16 — the primitives barrel ships Effect without `optimizePackageImports`; the theme is applied before first paint by a script
- Revised: 2026-09-23 by [ADR 0011](/projects/myself-app/adr/0011/) — a first visit paints the default theme, not `prefers-color-scheme`; the theme control is the site's own menu
- Revised: 2026-10-04 — the responsive rules below, after an audit found literal sizes, hand-written grids behind media queries and ten breakpoint widths

## Context

The old app styled with Emotion, which generates CSS at runtime from
JavaScript: every styled component must be a client component, which works
against pages rendered at build time
([ADR 0003](/projects/myself-app/adr/0003/)). entifix ships a
design system built for Tailwind v4.

## Decision

- **Tailwind v4, CSS-first**, with `@entifix/style/tokens.css` and its palette
  presets, each scoped to `[data-theme]` on `<html>`. The site's identity lives
  in the token values, never in a component.
- **Layout and atoms come from `@entifix/react-controls/primitives`**: Box,
  Center, Cluster, Cover, Grid, Sidebar, Switcher, Stack, atoms, Card,
  ThemeProvider and ThemeSwitcher.
- ⚠️ **The main barrel of `@entifix/react-controls` is never imported**, nor
  `./preferences`: the barrel pulls in the entity table and query machinery,
  about 541 KB, and `./preferences` brings Effect into the browser.
- ⚠️ **`./primitives` goes through `optimizePackageImports`**, because it
  is a barrel too and entifix's packages declare no `sideEffects`. Imported as-is, one `Stack` puts every `'use client'` module of
  the barrel on the page, `ThemeSwitcher`'s `@entifix/core` import with them,
  and Effect reaches the browser (measured: ~300 KB of gzipped JavaScript on a
  placeholder page instead of ~200 KB). `experimental.optimizePackageImports`
  for `@entifix/react-controls` and `@entifix/core` in `next.config.js` is what
  keeps a page to the modules it renders.
- **The theme is applied before first paint** by an inline script that reads
  the stored choice, or else the site's default theme
  ([ADR 0011](/projects/myself-app/adr/0011/)). entifix's `ThemeProvider` writes
  its starting theme to `<html>` on mount, so it starts from the theme already
  painted, and the theme control renders only after hydration.
- ⚠️ Tailwind v4 does not scan `node_modules`: an `@source` for the primitives'
  `dist`, or their classes produce no CSS and nothing reports it.
- Fonts self-hosted with `next/font`, so they are present when a page prints.
- d3 visualizations are client components coloured from the theme's CSS
  variables.

### Responsive rules

entifix's tokens are [Utopia](https://utopia.fyi)'s fluid scales (viewport
360–1240), and its primitives are [Every Layout](https://every-layout.dev)'s
intrinsic ones. The site keeps to both:

- **Sizes come from the scale.** Type is a `--text-step-*`, space a
  `--spacing-*`. A card or a panel pads with one of Utopia's one-up pairs
  (`--spacing-xs-s` … `--spacing-xl-2xl`, the site's `@theme` in `site.css`):
  tight on a phone, roomy on a desk, with no media query.
- **Layout is intrinsic first.** `Sidebar`, `Switcher`, `Grid` (auto-fill with
  `min(…, 100%)`) and `Cluster` wrap from their content. A component that must
  rearrange itself asks its own width with a container query — the filter
  rows stack below 28rem of fieldset, a page's head stacks its actions below
  30rem — not the screen's.
- **The screen is asked only for what is tied to it**: a sticky part, a phone's
  view switch, and a disclosure a before-paint script folds (`FoldScript`:
  nothing is laid out yet, so the window is the one width there is). Two
  widths, written in range syntax: narrow `(width < 40rem)` and wide
  `(width >= 64rem)`, declared in the UI's `theme/breakpoints.ts`.

## Alternatives

- **Emotion** — runtime CSS, client components only.
- **CSS Modules** — zero runtime, but no tokens, and nothing of entifix exercised.
