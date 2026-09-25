import { button } from '@entifix/react-controls/primitives';
import { localize, type Profile } from '@myself-app/domain';
import Link from 'next/link';

import { siteT } from '../../i18n/server';
import { sectionPath } from '../../landing-sections';
import { localePath, type SiteLocale } from '../../site-locales';
import { HeroBackdrop } from './hero-backdrop';
import { ScrollCue } from './scroll-cue';

/**
 * The landing page's first screen (#29): the name, the title and tagline
 * (#68), and the two calls to action, entering one after another (ADR 0011).
 * Facts come from `Profile`; the calls to action are copy.
 */
export function Hero({
  locale,
  profile,
}: {
  locale: SiteLocale;
  profile: Profile;
}) {
  const t = siteT(locale);
  return (
    <section aria-labelledby="hero-name" className="hero">
      <HeroBackdrop />
      <div className="hero-body">
        <h1 id="hero-name" className="hero-beat hero-name">
          {profile.firstName} {profile.lastName}
        </h1>
        {profile.title && (
          <p className="hero-beat hero-beat-2 hero-title">
            {localize(profile.title, locale)}
          </p>
        )}
        {profile.tagline && (
          <p className="hero-beat hero-beat-2 hero-tagline">
            {localize(profile.tagline, locale)}
          </p>
        )}
        <ul className="hero-beat hero-beat-3 hero-actions">
          <li>
            <Link
              className={button({ variant: 'primary', size: 'lg' })}
              href={localePath(locale, '/cv')}
            >
              {t('landing.hero.cv')}
            </Link>
          </li>
          <li>
            <Link
              className={button({ variant: 'secondary', size: 'lg' })}
              href={localePath(locale, '/tech-radar')}
            >
              {t('landing.hero.techRadar')}
            </Link>
          </li>
        </ul>
      </div>
      <ScrollCue
        href={sectionPath(locale, 'about')}
        label={t('landing.hero.scroll')}
      />
    </section>
  );
}
