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
import { PLACEHOLDER_COPY } from '../../../placeholder-copy';
import { isSiteLocale, localeAlternates } from '../../../site-locales';

const PATH = '/tech-radar';

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/tech-radar'>): Promise<Metadata> {
  const { locale } = await params;
  if (!isSiteLocale(locale)) notFound();
  const copy = PLACEHOLDER_COPY[locale];
  return {
    title: `${copy.techRadar} — ${copy.siteName}`,
    alternates: localeAlternates(locale, PATH),
  };
}

export default async function TechRadarPage({
  params,
}: PageProps<'/[locale]/tech-radar'>) {
  const { locale } = await params;
  if (!isSiteLocale(locale)) notFound();
  const copy = PLACEHOLDER_COPY[locale];
  return (
    <>
      <SiteNav locale={locale} path={PATH} />
      <Center as="main" gutters className="py-2xl">
        <Card>
          <Stack gap="s">
            <Text as="h1" step={3} weight="semibold">
              {copy.techRadar}
            </Text>
            <Lead muted>{copy.techRadarLead}</Lead>
          </Stack>
        </Card>
      </Center>
    </>
  );
}
