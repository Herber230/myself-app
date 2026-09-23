import '../global.css';

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ThemeScript } from '../../components/theme-script';
import { fontVariables } from '../../fonts';
import { siteT } from '../../i18n/server';
import { isSiteLocale, SITE_LOCALES } from '../../site-locales';
import { siteUrl } from '../../site-url';
import { Providers } from './providers';

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
          {children}
        </Providers>
      </body>
    </html>
  );
}
