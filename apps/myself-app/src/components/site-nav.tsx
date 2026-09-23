import Link from 'next/link';

import { siteT } from '../i18n/server';
import { LANDING_SECTIONS, sectionPath } from '../landing-sections';
import { localePath, SITE_LOCALES, type SiteLocale } from '../site-locales';
import { ActiveSection } from './active-section';
import { KeepSection } from './keep-section';
import { NavIcon, NavMenu, NavMenuCheck } from './nav-menu';
import { NavMenus } from './nav-menus';
import { SiteThemeMenu } from './site-theme-menu';

const linkClass =
  'rounded-sm text-content underline-offset-4 hover:text-primary hover:underline focus-ring aria-[current]:text-primary aria-[current]:underline';

/**
 * The site's one navigation bar (ADR 0011): the landing page's sections, the
 * CV and the radar, a language switch that keeps the page, and the theme
 * switcher.
 *
 * `path` is passed by each page rather than read from `usePathname`, so the nav
 * stays a server component. The language menu is a `<details>` of plain links,
 * so it works with scripting off. The client parts are leaves: the theme menu,
 * the dropdowns' closing (`NavMenus`), and on the landing page the section
 * tracking and the language switch's fragment.
 *
 * `reveal` is the landing page's variant: fixed to the top, hidden over the
 * hero and faded in by the page's scroll, in CSS only (`global.css`). Every
 * other page shows the bar as it is.
 */
export function SiteNav({
  locale,
  path,
  reveal = false,
}: {
  locale: SiteLocale;
  path: string;
  reveal?: boolean;
}) {
  const t = siteT(locale);
  // One list, rendered twice: inline on a wide screen, and in the menu panel
  // on a narrow one. CSS shows one of them (`display: none` on the other), so
  // assistive technology meets a single navigation either way.
  const links = (
    <ul>
      {LANDING_SECTIONS.map(section => (
        <li key={section}>
          <a
            className={`${linkClass} site-nav-link`}
            href={sectionPath(locale, section)}
            data-section={section}
          >
            <NavIcon name={section} />
            {t(`landing.nav.${section}`)}
          </a>
        </li>
      ))}
      <li>
        <Link
          className={`${linkClass} site-nav-link`}
          href={localePath(locale, '/cv')}
        >
          <NavIcon name="cv" />
          {t('cv')}
        </Link>
      </li>
      <li>
        <Link
          className={`${linkClass} site-nav-link`}
          href={localePath(locale, '/tech-radar')}
        >
          <NavIcon name="techRadar" />
          {t('techRadar')}
        </Link>
      </li>
    </ul>
  );
  return (
    <header className={reveal ? 'site-nav site-nav-reveal' : 'site-nav'}>
      <div className="site-nav-bar">
        <Link
          className={`${linkClass} site-nav-brand`}
          href={localePath(locale, '/')}
        >
          {t('siteName')}
        </Link>
        <nav aria-label={t('landing.nav.label')} className="site-nav-links">
          {links}
        </nav>
        <div className="site-nav-tools">
          <NavMenu
            label={t('language.label')}
            icon={<NavIcon name="globe" />}
            summary={
              <span className="nav-menu-code">{locale.toUpperCase()}</span>
            }
          >
            <ul>
              {SITE_LOCALES.map(each => (
                <li key={each}>
                  {each === locale ? (
                    <span
                      className="nav-menu-item"
                      aria-current="true"
                      lang={each}
                    >
                      <NavMenuCheck checked />
                      {t(`language.${each}`)}
                    </span>
                  ) : (
                    // A plain anchor: `KeepSection` rewrites its fragment on
                    // click, which a `Link` would ignore.
                    <a
                      className="nav-menu-item"
                      href={localePath(each, path)}
                      hrefLang={each}
                      lang={each}
                      data-keep-section
                    >
                      <NavMenuCheck checked={false} />
                      {t(`language.${each}`)}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </NavMenu>
          <SiteThemeMenu label={t('theme.label')} />
          <NavMenu
            label={t('menu')}
            icon={
              // Bars while closed, a cross while open (`global.css`).
              <>
                <NavIcon name="menu" className="nav-icon-when-closed" />
                <NavIcon name="close" className="nav-icon-when-open" />
              </>
            }
            chevron={false}
            className="nav-menu-sheet"
          >
            <nav aria-label={t('landing.nav.label')}>{links}</nav>
          </NavMenu>
        </div>
      </div>
      <NavMenus />
      {reveal && (
        <>
          <ActiveSection sections={LANDING_SECTIONS} />
          <KeepSection />
        </>
      )}
    </header>
  );
}
