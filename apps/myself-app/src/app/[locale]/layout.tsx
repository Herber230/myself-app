import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { isSiteLocale, SITE_LOCALES } from '../../site-locales';

/** Every locale is known at build time; any other segment is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return SITE_LOCALES.map(locale => ({ locale }));
}

export const metadata: Metadata = {
  // Absolute URLs for canonical and hreflang. The domain is set when hosting
  // is decided (ADR 0007); until then it is the local static server.
  metadataBase: new URL(
    process.env['NEXT_PUBLIC_SITE_URL'] ?? 'http://localhost:3100',
  ),
};

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<'/[locale]'>) {
  const { locale } = await params;
  if (!isSiteLocale(locale)) notFound();
  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
