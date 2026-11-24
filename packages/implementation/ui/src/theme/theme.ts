/**
 * The site's themes: the ids its palettes are declared under in
 * `styles/themes.css`, written to `data-theme` on <html>. In the order the
 * switcher offers them.
 */
export const SITE_THEMES = ['blue', 'light', 'dark'] as const;

export type SiteTheme = (typeof SITE_THEMES)[number];

/**
 * The theme a first visit paints, whatever the system's scheme: the site's own
 * blue, not a light or dark one (ADR 0011).
 */
export const DEFAULT_THEME = 'blue' satisfies SiteTheme;

/**
 * The cookie the chosen theme is kept in (entifix keeps a theme in a cookie,
 * so a server could render it; this site has none, and `ThemeScript` reads it
 * before the first paint). Namespaced, so another app on the same origin
 * cannot clobber it.
 */
export const THEME_COOKIE = 'myself-app-theme';
