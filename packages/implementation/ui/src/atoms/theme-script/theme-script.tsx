import { ThemeScript as EntifixThemeScript } from '@entifix/react-controls/primitives';

import {
  DEFAULT_THEME,
  SITE_THEMES,
  THEME_STORAGE_KEY,
} from '../../theme/theme.js';

/** The script reads ids only; a theme's label is the menu's to translate. */
const THEMES = SITE_THEMES.map(id => ({ id, label: id }));

/**
 * The site's palette set before the first paint (ADR 0011), through
 * entifix's `ThemeScript`: a stored choice wins, otherwise `DEFAULT_THEME`,
 * whatever the system's scheme, stored so `ThemeProvider` mounts with it.
 */
export function ThemeScript() {
  return (
    <EntifixThemeScript
      themes={THEMES}
      defaultTheme={DEFAULT_THEME}
      storageKey={THEME_STORAGE_KEY}
    />
  );
}
