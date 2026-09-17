# 6. Tailwind v4 and everything `@entifix/style` involves

- Status: Accepted
- Date: 2026-09-17
- Area: ui
- Read when: styling anything, or when a primitive renders unstyled

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
- ⚠️ Tailwind v4 does not scan `node_modules`: an `@source` for the primitives'
  `dist`, or their classes produce no CSS and nothing reports it.
- Fonts self-hosted with `next/font`, so they are present when a page prints.
- d3 visualizations are client components coloured from the theme's CSS
  variables.

## Alternatives

- **Emotion** — runtime CSS, client components only.
- **CSS Modules** — zero runtime, but no tokens, and nothing of entifix exercised.
