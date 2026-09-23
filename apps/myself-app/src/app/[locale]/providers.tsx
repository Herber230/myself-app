'use client';

// Installs the catalogs for the **client** bundle. The server graph installs
// its own through `i18n/server.ts`: separate bundles, separate module state.
import '../../i18n/install';

import { I18nProvider } from '@entifix/react-controls/i18next';
import { ThemeProvider } from '@entifix/react-controls/primitives';
import { type ReactNode, useState } from 'react';

import type { SiteLocale } from '../../site-locales';
import { SITE_THEMES, type SiteTheme, THEME_STORAGE_KEY } from '../../theme';

/**
 * The theme a page is already painted in: `ThemeScript` wrote it before
 * hydration. `ThemeProvider` writes its starting theme to <html> on mount, so
 * starting from anything else would flip the palette for a frame.
 *
 * `undefined` on the server, where nothing renders from it: the one component
 * that does, the theme menu, mounts on the client only (`SiteThemeMenu`).
 */
function paintedTheme(): string | undefined {
  return typeof document === 'undefined'
    ? undefined
    : document.documentElement.dataset['theme'];
}

export function Providers({
  children,
  locale,
  themeLabels,
}: {
  children: ReactNode;
  locale: SiteLocale;
  /** Translated by the layout, so the provider needs no catalog lookup. */
  themeLabels: Record<SiteTheme, string>;
}) {
  const [defaultTheme] = useState(paintedTheme);
  const themes = SITE_THEMES.map(id => ({ id, label: themeLabels[id] }));
  return (
    <I18nProvider locale={locale}>
      <ThemeProvider
        themes={themes}
        defaultTheme={defaultTheme}
        storageKey={THEME_STORAGE_KEY}
      >
        {children}
      </ThemeProvider>
    </I18nProvider>
  );
}
