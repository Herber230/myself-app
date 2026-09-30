import '../global.css';

import { SiteBackdrop, ThemeScript } from '@myself-app/implementation-ui/atoms';
import { siteT } from '@myself-app/implementation-ui/i18n';
import { Providers } from '@myself-app/implementation-ui/providers';
import {
  isSiteLocale,
  SITE_LOCALES,
} from '@myself-app/implementation-ui/routing';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { fontVariables } from '../../fonts';
import { siteUrl } from '../../site-url';

/** Every locale is known at build time; any other segment is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return SITE_LOCALES.map(locale => ({ locale }));
}

export const metadata: Metadata = {
  // Absolute URLs for canonical and hreflang (ADR 0007).
  metadataBase: siteUrl(),
};

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<'/[locale]'>) {
  const { locale } = await params;
  if (!isSiteLocale(locale)) notFound();
  const t = siteT(locale);
  return (
    // `suppressHydrationWarning`: `ThemeScript` sets `data-theme` on this
    // element before hydration, which the static HTML cannot know.
    <html lang={locale} className={fontVariables} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        {/* A client component, but `children` reaches it as a prop, so every
            page below still renders at build. */}
        <Providers
          locale={locale}
          themeLabels={{
            blue: t('theme.blue'),
            light: t('theme.light'),
            dark: t('theme.dark'),
          }}
        >
          {/* The backdrop behind every page (the hero covers it on the
              landing page; the CV hides it, `site.css`). */}
          <div className="site-backdrop-host">
            <SiteBackdrop />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
