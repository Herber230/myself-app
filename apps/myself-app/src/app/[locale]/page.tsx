import { loadContactChannels } from '@myself-app/domain/use-cases';
import { loadProfile } from '@myself-app/domain/use-cases';
import { loadFeaturedProjects } from '@myself-app/domain/use-cases';
import { siteT } from '@myself-app/implementation-ui/i18n';
import { AboutSection } from '@myself-app/implementation-ui/organisms';
import { ContactSection } from '@myself-app/implementation-ui/organisms';
import { EntifixSection } from '@myself-app/implementation-ui/organisms';
import { Hero } from '@myself-app/implementation-ui/organisms';
import { ProjectsSection } from '@myself-app/implementation-ui/organisms';
import { SiteNav } from '@myself-app/implementation-ui/organisms';
import {
  isSiteLocale,
  localeAlternates,
} from '@myself-app/implementation-ui/routing';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { SITE_CONTENT } from '../../composition';

const PATH = '/';

export async function generateMetadata({
  params,
}: PageProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params;
  if (!isSiteLocale(locale)) notFound();
  const t = siteT(locale);
  return {
    title: t('siteName'),
    alternates: localeAlternates(locale, PATH),
  };
}

/** The sections run in `LANDING_SECTIONS` order: the nav's anchors follow it. */
export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params;
  if (!isSiteLocale(locale)) notFound();
  const [profile, projects, channels] = await Promise.all([
    loadProfile(SITE_CONTENT),
    loadFeaturedProjects(SITE_CONTENT),
    loadContactChannels(SITE_CONTENT),
  ]);
  return (
    <>
      <SiteNav locale={locale} path={PATH} reveal />
      <main>
        <Hero locale={locale} profile={profile} />
        <AboutSection locale={locale} profile={profile} />
        <ProjectsSection locale={locale} projects={projects} />
        <EntifixSection locale={locale} />
        <ContactSection locale={locale} channels={channels} />
      </main>
    </>
  );
}
