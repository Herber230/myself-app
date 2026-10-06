import { Lead } from '@entifix/react-controls/primitives';
import { localize, type Profile } from '@myself-app/domain';
import type { Career } from '@myself-app/domain/use-cases';

import { siteT } from '../../i18n/server.js';
import { LandingSection } from '../../molecules/landing-section/landing-section.js';
import type { SiteLocale } from '../../routing/site-locales.js';
import { inLocale } from '../cv-sheet/cv-format.js';

/**
 * Who I am, from `Profile` (#32): the portrait and a few facts beside the bio,
 * above it on a narrow screen. The bio's paragraphs are split on blank lines.
 * The facts are content: where from `Profile`, how long and where now from
 * the employments (`loadCareer`).
 */
export function AboutSection({
  locale,
  profile,
  career = {},
}: {
  locale: SiteLocale;
  profile: Profile;
  career?: Career;
}) {
  const t = siteT(locale);
  const paragraphs = profile.bio
    ? localize(profile.bio, locale).split(/\n{2,}/)
    : [];
  const facts = [
    profile.location && {
      label: t('landing.about.location'),
      value: localize(profile.location, locale),
    },
    career.since && {
      label: t('landing.about.since'),
      value: String(career.since.getUTCFullYear()),
    },
    career.current && {
      label: t('landing.about.current'),
      value: t('landing.about.role', {
        role: inLocale(career.current.period.role, locale),
        employer: career.current.employer.name,
      }),
    },
  ].filter(fact => fact !== undefined);
  return (
    <LandingSection id="about" locale={locale}>
      <div className="about-body">
        {(profile.pictureUrl || facts.length > 0) && (
          <div className="about-aside">
            {profile.pictureUrl && (
              <img
                className="about-portrait"
                src={profile.pictureUrl}
                alt={
                  profile.pictureAlt ? localize(profile.pictureAlt, locale) : ''
                }
                width={960}
                height={1200}
                loading="lazy"
                decoding="async"
              />
            )}
            {facts.length > 0 && (
              <dl className="about-facts" aria-label={t('landing.about.facts')}>
                {facts.map(({ label, value }) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        )}
        {paragraphs.length > 0 && (
          <div className="landing-prose about-bio">
            {paragraphs.map(paragraph => (
              <Lead key={paragraph}>{paragraph}</Lead>
            ))}
          </div>
        )}
      </div>
    </LandingSection>
  );
}
