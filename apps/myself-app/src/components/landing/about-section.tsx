import { Lead } from '@entifix/react-controls/primitives';
import { localize, type Profile } from '@myself-app/domain';

import type { SiteLocale } from '../../site-locales';
import { LandingSection } from './landing-section';

/**
 * Who I am, from `Profile` (#32). The bio only: the picture waits for the
 * content pass (#26).
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
      {profile.bio && (
        <Lead className="landing-prose">{localize(profile.bio, locale)}</Lead>
      )}
    </LandingSection>
  );
}
