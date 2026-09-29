import '../global.css';

import { ThemeScript } from '@myself-app/implementation-ui/atoms';
import { SITE_DEFAULT_LOCALE } from '@myself-app/implementation-ui/routing';
import type { ReactNode } from 'react';

import { fontVariables } from '../../fonts';

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
