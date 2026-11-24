import { ThemeScript as EntifixThemeScript } from '@entifix/react-controls/primitives';

import { DEFAULT_THEME, SITE_THEMES, THEME_COOKIE } from '../../theme/theme.js';

/** The script reads ids only; a theme's label is the menu's to translate. */
const THEMES = SITE_THEMES.map(id => ({ id, label: id }));

/**
 * The site's palette set before the first paint (ADR 0011), through
 * entifix's `ThemeScript`: a stored choice wins, otherwise `DEFAULT_THEME`,
 * whatever the system's scheme. Nothing is written: only a choice is stored.
 */
export function ThemeScript() {
  return (
    <EntifixThemeScript
      themes={THEMES}
      defaultTheme={DEFAULT_THEME}
      storageKey={THEME_COOKIE}
    />
  );
}
