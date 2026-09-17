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
      <main>
        <h1>{copy.cv}</h1>
        <p>{copy.cvLead}</p>
      </main>
    </>
  );
}
