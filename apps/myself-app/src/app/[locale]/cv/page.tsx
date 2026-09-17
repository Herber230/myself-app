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

const PATH = '/cv';

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/cv'>): Promise<Metadata> {
  const { locale } = await params;
  if (!isSiteLocale(locale)) notFound();
  const copy = PLACEHOLDER_COPY[locale];
  return {
    title: `${copy.cv} — ${copy.siteName}`,
    alternates: localeAlternates(locale, PATH),
  };
}

export default async function CvPage({ params }: PageProps<'/[locale]/cv'>) {
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
              {copy.cv}
            </Text>
            <Lead muted>{copy.cvLead}</Lead>
          </Stack>
        </Card>
      </Center>
    </>
  );
}
