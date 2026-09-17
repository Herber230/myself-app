import type { Metadata } from 'next';

import { PLACEHOLDER_COPY } from '../placeholder-copy';
import { localePath, SITE_LOCALES } from '../site-locales';

export const metadata: Metadata = {
  title: `404 — ${PLACEHOLDER_COPY.en.siteName}`,
  robots: { index: false },
};

/**
 * The export's `404.html`. It cannot know which locale the visitor wanted, so
 * it speaks both and links to each home.
 */
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body>
        <main>
          {SITE_LOCALES.map(locale => (
            <section key={locale} lang={locale}>
              <h1>{PLACEHOLDER_COPY[locale].notFoundTitle}</h1>
              <p>{PLACEHOLDER_COPY[locale].notFoundLead}</p>
              <p>
                <a href={localePath(locale, '/')}>
                  {PLACEHOLDER_COPY[locale].home}
                </a>
              </p>
            </section>
          ))}
        </main>
      </body>
    </html>
  );
}
