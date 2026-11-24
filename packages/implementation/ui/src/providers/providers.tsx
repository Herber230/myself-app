'use client';

// Installs the catalogs for the **client** bundle. The server graph installs
// its own through `i18n/server.ts`: separate bundles, separate module state.
import '../i18n/install.js';

import { I18nProvider } from '@entifix/react-controls/i18next';
import { ThemeProvider } from '@entifix/react-controls/primitives';
import type { ReactNode } from 'react';

import type { SiteLocale } from '../routing/site-locales.js';
import {
  DEFAULT_THEME,
  SITE_THEMES,
  type SiteTheme,
  THEME_COOKIE,
} from '../theme/theme.js';

/**
 * The site's providers. `ThemeProvider` starts from `DEFAULT_THEME` and adopts
 * the stored choice after mount without reflecting the default first, so the
 * palette `ThemeScript` painted before hydration is never flipped for a frame.
 */
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
  const themes = SITE_THEMES.map(id => ({ id, label: themeLabels[id] }));
  return (
    <I18nProvider locale={locale}>
      <ThemeProvider
        themes={themes}
        defaultTheme={DEFAULT_THEME}
        storageKey={THEME_COOKIE}
      >
        {children}
      </ThemeProvider>
    </I18nProvider>
  );
}
