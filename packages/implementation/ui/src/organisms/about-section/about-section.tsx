import { Lead } from '@entifix/react-controls/primitives';
import { localize, type Profile } from '@myself-app/domain';

import { LandingSection } from '../../molecules/landing-section/landing-section.js';
import type { SiteLocale } from '../../routing/site-locales.js';

/**
 * Who I am, from `Profile` (#32): the portrait beside the bio, above it on a
 * narrow screen.
 */
export function AboutSection({
  locale,
  profile,
}: {
  locale: SiteLocale;
  profile: Profile;
}) {
  return (
    <LandingSection id="about" locale={locale}>
      <div className="about-body">
        {profile.pictureUrl && (
          <img
            className="about-portrait"
            src={profile.pictureUrl}
            alt={profile.pictureAlt ? localize(profile.pictureAlt, locale) : ''}
            width={960}
            height={1200}
            loading="lazy"
            decoding="async"
          />
        )}
        {profile.bio && (
          <Lead className="landing-prose">{localize(profile.bio, locale)}</Lead>
        )}
      </div>
    </LandingSection>
  );
}
