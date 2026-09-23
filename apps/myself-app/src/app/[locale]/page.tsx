import { Center, Lead, Stack, Text } from '@entifix/react-controls/primitives';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Hero } from '../../components/landing/hero';
import { SiteNav } from '../../components/site-nav';
import { loadProfile } from '../../content/profile';
import { SITE_REPOSITORIES } from '../../content/repositories';
import { siteT } from '../../i18n/server';
import { LANDING_SECTIONS } from '../../landing-sections';
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

export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params;
  if (!isSiteLocale(locale)) notFound();
  const t = siteT(locale);
  const profile = await loadProfile(SITE_REPOSITORIES);
  return (
    <>
      <SiteNav locale={locale} path={PATH} reveal />
      <main>
        <Hero locale={locale} profile={profile} />
        {/* Shells until each section is built: #32, #30, #31, #32. They give
            the nav its anchors and the page its scroll. */}
        {LANDING_SECTIONS.map(section => (
          <section
            key={section}
            id={section}
            aria-labelledby={`${section}-heading`}
            className="landing-section"
          >
            <Center gutters>
              <Stack gap="s">
                <Text
                  as="h2"
                  id={`${section}-heading`}
                  step={3}
                  weight="semibold"
                >
                  {t(`landing.headings.${section}`)}
                </Text>
                <Lead muted>{t('landing.comingSoon')}</Lead>
              </Stack>
            </Center>
          </section>
        ))}
      </main>
    </>
  );
}
