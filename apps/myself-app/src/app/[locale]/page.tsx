import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { AboutSection } from '../../components/landing/about-section';
import { ContactSection } from '../../components/landing/contact-section';
import { EntifixSection } from '../../components/landing/entifix-section';
import { Hero } from '../../components/landing/hero';
import { ProjectsSection } from '../../components/landing/projects-section';
import { SiteNav } from '../../components/site-nav';
import { loadContactChannels } from '../../content/contact';
import { loadProfile } from '../../content/profile';
import { loadFeaturedProjects } from '../../content/projects';
import { SITE_CONTENT } from '../../content/repositories';
import { siteT } from '../../i18n/server';
import { isSiteLocale, localeAlternates } from '../../site-locales';

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
