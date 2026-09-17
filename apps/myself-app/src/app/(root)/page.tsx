import type { Metadata } from 'next';

import { PLACEHOLDER_COPY } from '../../placeholder-copy';
import { localePath, SITE_DEFAULT_LOCALE } from '../../site-locales';

const target = localePath(SITE_DEFAULT_LOCALE, '/');

export const metadata: Metadata = {
  title: PLACEHOLDER_COPY[SITE_DEFAULT_LOCALE].siteName,
  alternates: { canonical: target },
  robots: { index: false },
};

/**
 * `/` sends the visitor to the default locale. A static export has no server
 * to answer with a redirect (ADR 0007), so the page does it with a refresh —
 * which needs no JavaScript — and a link for anyone it does not move.
 */
export default function RootRedirectPage() {
  return (
    <>
      <meta httpEquiv="refresh" content={`0; url=${target}`} />
      <p>
        <a href={target}>{PLACEHOLDER_COPY[SITE_DEFAULT_LOCALE].redirecting}</a>
      </p>
    </>
  );
}
