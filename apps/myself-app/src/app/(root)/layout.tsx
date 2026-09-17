import '../global.css';

import type { ReactNode } from 'react';

import { ThemeScript } from '../../components/theme-script';
import { fontVariables } from '../../fonts';
import { SITE_DEFAULT_LOCALE } from '../../site-locales';

/**
 * The root layout for `/` alone. Every other page sits under `[locale]`, whose
 * layout is a second root layout so that `<html lang>` is the page's own.
 */
export default function RootRedirectLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html
      lang={SITE_DEFAULT_LOCALE}
      className={fontVariables}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body>{children}</body>
    </html>
  );
}
