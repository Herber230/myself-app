# 6. Tailwind v4 and everything `@entifix/style` involves

- Status: Accepted
- Date: 2026-09-17
- Area: ui
- Read when: styling anything, or when a primitive renders unstyled
- Revised: 2026-09-17 by #16 — the primitives barrel ships Effect without `optimizePackageImports`; the theme is applied before first paint by a script
- Revised: 2026-09-23 by [ADR 0011](0011-a-moving-hero-a-revealing-nav-and-a-blue-theme.md) — a first visit paints the default theme, not `prefers-color-scheme`; the theme control is the site's own menu

## Context

The old app styled with Emotion, which generates CSS at runtime from
JavaScript: every styled component must be a client component, which works
against pages rendered at build time
([ADR 0003](0003-build-time-pages-and-browser-queries.md)). entifix ships a
design system built for Tailwind v4.

## Decision

- **Tailwind v4, CSS-first**, with `@entifix/style/tokens.css` and its palette
  presets, each scoped to `[data-theme]` on `<html>`. The site's identity lives
  in the token values, never in a component.
- **`@entifix/react-controls/primitives`** for layout primitives (Box, Center,
  Cluster, Cover, Grid, Sidebar, Switcher, Stack), atoms, Card, ThemeProvider and
  ThemeSwitcher.
- ⚠️ **Never the main barrel** of `@entifix/react-controls` — it pulls in the
  entity table and query machinery, about 541 KB — **and never `./preferences`**,
  which brings Effect into the browser.
- ⚠️ **`./primitives` is a barrel too**, and entifix's packages declare no
  `sideEffects`. Imported as-is, one `Stack` puts every `'use client'` module of
  the barrel on the page, `ThemeSwitcher`'s `@entifix/core` import with them,
  and Effect reaches the browser (measured: ~300 KB of gzipped JavaScript on a
  placeholder page instead of ~200 KB). `experimental.optimizePackageImports`
  for `@entifix/react-controls` and `@entifix/core` in `next.config.js` is what
  keeps a page to the modules it renders.
- **The theme is applied before first paint** by an inline script that reads
  the stored choice, or else the site's default theme
  ([ADR 0011](0011-a-moving-hero-a-revealing-nav-and-a-blue-theme.md)). entifix's `ThemeProvider` writes
  its starting theme to `<html>` on mount, so it starts from the theme already
  painted, and the theme control renders only after hydration.
- ⚠️ Tailwind v4 does not scan `node_modules`: an `@source` for the primitives'
  `dist`, or their classes produce no CSS and nothing reports it.
- Fonts self-hosted with `next/font`, so they are present when a page prints.
- d3 visualizations are client components coloured from the theme's CSS
  variables.

## Alternatives

- **Emotion** — runtime CSS, client components only.
- **CSS Modules** — zero runtime, but no tokens, and nothing of entifix exercised.
