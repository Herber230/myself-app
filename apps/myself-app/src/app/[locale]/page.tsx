import {
  loadBeyondCodeTeaser,
  loadContactChannels,
  loadFeaturedProjects,
  loadPersonalChannels,
  loadProfile,
} from '@myself-app/domain/use-cases';
import { siteT } from '@myself-app/implementation-ui/i18n';
import {
  isSiteLocale,
  localeAlternates,
} from '@myself-app/implementation-ui/routing';
import { LandingPageView } from '@myself-app/implementation-ui/templates';
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

export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params;
  if (!isSiteLocale(locale)) notFound();
  const [profile, projects, channels, beyondCode, personalChannels] =
    await Promise.all([
      loadProfile(SITE_CONTENT),
      loadFeaturedProjects(SITE_CONTENT),
      loadContactChannels(SITE_CONTENT),
      loadBeyondCodeTeaser(SITE_CONTENT),
      loadPersonalChannels(SITE_CONTENT),
    ]);
  return (
    <LandingPageView
      locale={locale}
      profile={profile}
      projects={projects}
      channels={channels}
      beyondCode={beyondCode}
      personalChannels={personalChannels}
    />
  );
}
