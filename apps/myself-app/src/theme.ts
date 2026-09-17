/**
 * The site's themes: the ids its palettes are declared under in
 * `app/themes.css`, written to `data-theme` on <html>.
 */
export const SITE_THEMES = ['light', 'dark'] as const;

export type SiteTheme = (typeof SITE_THEMES)[number];

/** Namespaced, so another app on the same origin cannot clobber it. */
export const THEME_STORAGE_KEY = 'myself-app-theme';
