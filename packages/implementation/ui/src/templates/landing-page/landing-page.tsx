import type { ContactChannel, Profile } from '@myself-app/domain';
import type {
  BeyondCodeTeaser as BeyondCodeTeaserData,
  Career,
  FeaturedProject,
} from '@myself-app/domain/use-cases';

import { AboutSection } from '../../organisms/about-section/about-section.js';
import { BeyondCodeTeaser } from '../../organisms/beyond-code-teaser/beyond-code-teaser.js';
import { ContactSection } from '../../organisms/contact-section/contact-section.js';
import { Hero } from '../../organisms/hero/hero.js';
import { ProjectsSection } from '../../organisms/projects-section/projects-section.js';
import { SiteNav } from '../../organisms/site-nav/site-nav.js';
import type { SiteLocale } from '../../routing/site-locales.js';

export interface LandingPageData {
  readonly locale: SiteLocale;
  readonly profile: Profile;
  /** The facts beside the bio. */
  readonly career: Career;
  readonly projects: readonly FeaturedProject[];
  readonly channels: readonly ContactChannel[];
  readonly beyondCode: BeyondCodeTeaserData;
  /** The personal channels, for the "Beyond the code" teaser. */
  readonly personalChannels: readonly ContactChannel[];
}

/**
 * The landing page (ADR 0008): the hero, then its sections in
 * `LANDING_SECTIONS` order, which the nav's anchors follow, and last the
 * door to "Beyond the code", which is a page rather than an anchor. The layout lays
 * it over the site's backdrop, which the hero hides.
 */
export function LandingPageView({
  locale,
  profile,
  career,
  projects,
  channels,
  beyondCode,
  personalChannels,
}: LandingPageData) {
  return (
    <>
      <SiteNav locale={locale} path="/" reveal />
      <main>
        <Hero locale={locale} profile={profile} />
        <AboutSection locale={locale} profile={profile} career={career} />
        <ProjectsSection locale={locale} projects={projects} />
        <ContactSection locale={locale} channels={channels} />
        <BeyondCodeTeaser
          locale={locale}
          teaser={beyondCode}
          channels={personalChannels}
        />
      </main>
    </>
  );
}
