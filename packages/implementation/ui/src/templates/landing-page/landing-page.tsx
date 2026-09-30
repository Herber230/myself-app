import type { ContactChannel, Profile } from '@myself-app/domain';
import type { FeaturedProject } from '@myself-app/domain/use-cases';

import { SiteBackdrop } from '../../atoms/site-backdrop/site-backdrop.js';
import { AboutSection } from '../../organisms/about-section/about-section.js';
import { ContactSection } from '../../organisms/contact-section/contact-section.js';
import { EntifixSection } from '../../organisms/entifix-section/entifix-section.js';
import { Hero } from '../../organisms/hero/hero.js';
import { ProjectsSection } from '../../organisms/projects-section/projects-section.js';
import { SiteNav } from '../../organisms/site-nav/site-nav.js';
import type { SiteLocale } from '../../routing/site-locales.js';

export interface LandingPageData {
  readonly locale: SiteLocale;
  readonly profile: Profile;
  readonly projects: readonly FeaturedProject[];
  readonly channels: readonly ContactChannel[];
}

/**
 * The landing page (ADR 0008): the hero, then its sections in
 * `LANDING_SECTIONS` order, which the nav's anchors follow, over the
 * backdrop the hero hides.
 */
export function LandingPageView({
  locale,
  profile,
  projects,
  channels,
}: LandingPageData) {
  return (
    <>
      <SiteNav locale={locale} path="/" reveal />
      <main className="site-backdrop-host">
        <SiteBackdrop />
        <Hero locale={locale} profile={profile} />
        <AboutSection locale={locale} profile={profile} />
        <ProjectsSection locale={locale} projects={projects} />
        <EntifixSection locale={locale} />
        <ContactSection locale={locale} channels={channels} />
      </main>
    </>
  );
}
