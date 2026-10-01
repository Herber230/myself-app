import { siteT } from '@myself-app/implementation-ui/i18n';
import {
  localePath,
  SITE_DEFAULT_LOCALE,
} from '@myself-app/implementation-ui/routing';
import type { Metadata } from 'next';

const target = localePath(SITE_DEFAULT_LOCALE, '/');
const t = siteT(SITE_DEFAULT_LOCALE);

export const metadata: Metadata = {
  title: t('siteName'),
  alternates: { canonical: target },
  robots: { index: false },
};

/**
 * `/` sends the visitor to the default locale. A static export has no server
 * to answer with a redirect (ADR 0007), so the page does it with a refresh —
 * which needs no JavaScript — and a link for anyone it does not move. The
 * refresh usually lands within a frame, so the page shows a spinner and holds
 * the link back until the move has plainly not happened.
 */
export default function RootRedirectPage() {
  return (
    <>
      <meta httpEquiv="refresh" content={`0; url=${target}`} />
      <main className="root-redirect" aria-busy="true">
        <span className="root-redirect-spinner" aria-hidden="true" />
        <a className="root-redirect-link" href={target}>
          {t('redirecting')}
        </a>
      </main>
    </>
  );
}
