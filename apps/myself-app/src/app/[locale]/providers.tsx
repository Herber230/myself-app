'use client';

import { ThemeProvider } from '@entifix/react-controls/primitives';
import { type ReactNode, useState } from 'react';

import { SITE_THEMES, THEME_STORAGE_KEY } from '../../theme';

/**
 * The theme a page is already painted in: `ThemeScript` wrote it before
 * hydration. `ThemeProvider` writes its starting theme to <html> on mount, so
 * starting from anything else would flip the palette for a frame.
 *
 * `undefined` on the server, where nothing renders from it: the one component
 * that does, the switcher, mounts on the client only (`SiteThemeSwitcher`).
 */
function paintedTheme(): string | undefined {
  return typeof document === 'undefined'
    ? undefined
    : document.documentElement.dataset['theme'];
}

export function Providers({ children }: { children: ReactNode }) {
  const [defaultTheme] = useState(paintedTheme);
  const themes = SITE_THEMES.map(id => ({ id, label: id }));
  return (
    <ThemeProvider
      themes={themes}
      defaultTheme={defaultTheme}
      storageKey={THEME_STORAGE_KEY}
    >
      {children}
    </ThemeProvider>
  );
}
