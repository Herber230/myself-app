import Link from 'next/link';

import { PLACEHOLDER_COPY } from '../placeholder-copy';
import { localePath, SITE_LOCALES, type SiteLocale } from '../site-locales';

/**
 * The three destinations, and a language switch that keeps the page.
 *
 * `path` is passed by each page rather than read from `usePathname`, so the nav
 * stays a server component and ships no JavaScript of its own.
 */
export function SiteNav({
  locale,
  path,
}: {
  locale: SiteLocale;
  path: string;
}) {
  const copy = PLACEHOLDER_COPY[locale];
  const other = SITE_LOCALES.find(each => each !== locale) ?? locale;
  return (
    <nav>
      <ul>
        <li>
          <Link href={localePath(locale, '/')}>{copy.home}</Link>
        </li>
        <li>
          <Link href={localePath(locale, '/cv')}>{copy.cv}</Link>
        </li>
        <li>
          <Link href={localePath(locale, '/tech-radar')}>{copy.techRadar}</Link>
        </li>
        <li>
          <Link href={localePath(other, path)} hrefLang={other} lang={other}>
            {copy.otherLanguage}
          </Link>
        </li>
      </ul>
    </nav>
  );
}
