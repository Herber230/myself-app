import '../global.css';

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { fontVariables } from '../../fonts';
import { siteUrl } from '../../site-url';

/**
 * The root layout of the shared pages under `/for/`: short-lived pages,
 * English only, reached by their link alone. Nothing of the site links to
 * them, no sitemap lists them, and no search engine should keep them.
 *
 * No `ThemeScript` and no `Providers`: a shared page wears its own palette
 * and reads nothing of the site's context.
 */
export const metadata: Metadata = {
  metadataBase: siteUrl(),
  robots: { index: false, follow: false },
};

export default function SharedLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
