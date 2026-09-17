import { Cluster } from '@entifix/react-controls/primitives';
import Link from 'next/link';

import { PLACEHOLDER_COPY } from '../placeholder-copy';
import { localePath, SITE_LOCALES, type SiteLocale } from '../site-locales';
import { SiteThemeSwitcher } from './site-theme-switcher';

const linkClass =
  'rounded-sm text-content underline-offset-4 hover:text-primary hover:underline focus-ring';

/**
 * The three destinations, a language switch that keeps the page, and the theme
 * switcher.
 *
 * `path` is passed by each page rather than read from `usePathname`, so the nav
 * stays a server component. Only the theme switcher is a client leaf.
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
    <header className="border-b border-border bg-surface-elevated">
      <Cluster
        justify="between"
        align="center"
        gap="m"
        className="mx-auto max-w-5xl px-m py-s"
      >
        <nav>
          <Cluster as="ul" gap="m" className="m-0 list-none p-0">
            <li>
              <Link className={linkClass} href={localePath(locale, '/')}>
                {copy.home}
              </Link>
            </li>
            <li>
              <Link className={linkClass} href={localePath(locale, '/cv')}>
                {copy.cv}
              </Link>
            </li>
            <li>
              <Link
                className={linkClass}
                href={localePath(locale, '/tech-radar')}
              >
                {copy.techRadar}
              </Link>
            </li>
            <li>
              <Link
                className={linkClass}
                href={localePath(other, path)}
                hrefLang={other}
                lang={other}
              >
                {copy.otherLanguage}
              </Link>
            </li>
          </Cluster>
        </nav>
        <SiteThemeSwitcher />
      </Cluster>
    </header>
  );
}
