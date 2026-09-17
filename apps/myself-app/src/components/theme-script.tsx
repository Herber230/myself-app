import { SITE_THEMES, THEME_STORAGE_KEY } from '../theme';

/**
 * Sets `data-theme` on <html> before the first paint, so an exported page never
 * flashes the wrong palette. It runs inline in <head>, ahead of any stylesheet
 * applying and long before React hydrates.
 *
 * A stored choice wins; otherwise the system's `prefers-color-scheme`. When
 * nothing is stored, the resolved theme is stored: entifix's `ThemeProvider`
 * persists whatever theme it mounts with, and without a stored value to read it
 * would mount with its default and pin a dark-system visitor to light.
 */
const script = `(function () {
  try {
    var themes = ${JSON.stringify(SITE_THEMES)};
    var key = ${JSON.stringify(THEME_STORAGE_KEY)};
    var theme = window.localStorage.getItem(key);
    if (themes.indexOf(theme) === -1) {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      window.localStorage.setItem(key, theme);
    }
    document.documentElement.dataset.theme = theme;
  } catch (error) {}
})();`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
