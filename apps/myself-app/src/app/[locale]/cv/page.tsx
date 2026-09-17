import {
  Card,
  Center,
  Lead,
  Stack,
  Text,
} from '@entifix/react-controls/primitives';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { SiteNav } from '../../../components/site-nav';
import { siteT } from '../../../i18n/server';
import { isSiteLocale, localeAlternates } from '../../../site-locales';

const PATH = '/cv';

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/cv'>): Promise<Metadata> {
  const { locale } = await params;
  if (!isSiteLocale(locale)) notFound();
  const t = siteT(locale);
  return {
    title: `${t('cv')} — ${t('siteName')}`,
    alternates: localeAlternates(locale, PATH),
  };
}

export default async function CvPage({ params }: PageProps<'/[locale]/cv'>) {
  const { locale } = await params;
  if (!isSiteLocale(locale)) notFound();
  const t = siteT(locale);
  return (
    <>
      <SiteNav locale={locale} path={PATH} />
      <Center as="main" gutters className="py-2xl">
        <Card>
          <Stack gap="s">
            <Text as="h1" step={3} weight="semibold">
              {t('cv')}
            </Text>
            <Lead muted>{t('cvLead')}</Lead>
          </Stack>
        </Card>
      </Center>
    </>
  );
}
