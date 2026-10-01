import { join } from 'node:path';

import type { LocalizedText } from '@myself-app/domain';
import {
  loadBeyondCode,
  loadPersonalChannels,
} from '@myself-app/domain/use-cases';
import { siteT } from '@myself-app/implementation-ui/i18n';
import {
  inLocale,
  renderMarkdownBody,
} from '@myself-app/implementation-ui/organisms';
import {
  isSiteLocale,
  localeAlternates,
} from '@myself-app/implementation-ui/routing';
import { BeyondCodePageView } from '@myself-app/implementation-ui/templates';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { SITE_CONTENT } from '../../../composition';
import { loadSitePaths } from '../../../content/site-paths';

const PATH = '/beyond-code';

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/beyond-code'>): Promise<Metadata> {
  const { locale } = await params;
  if (!isSiteLocale(locale)) notFound();
  const t = siteT(locale);
  return {
    title: `${t('beyondCode.title')} — ${t('siteName')}`,
    description: t('beyondCode.lead'),
    alternates: localeAlternates(locale, PATH),
  };
}

/**
 * "Beyond the code": every interest, each with its body rendered from
 * Markdown at build.
 */
export default async function BeyondCodePage({
  params,
}: PageProps<'/[locale]/beyond-code'>) {
  const { locale } = await params;
  if (!isSiteLocale(locale)) notFound();
  const [sections, sitePaths, channels] = await Promise.all([
    loadBeyondCode(SITE_CONTENT),
    loadSitePaths(SITE_CONTENT),
    loadPersonalChannels(SITE_CONTENT),
  ]);
  const bodies = Object.fromEntries(
    await Promise.all(
      sections.map(async ({ interest }) => {
        const id = String(interest.id);
        const body = await renderMarkdownBody({
          source: `interests/${id}.${locale}.md`,
          id,
          // The build requires a body in every locale.
          markdown: inLocale(interest.body as LocalizedText, locale),
          locale,
          sitePaths,
          // The build runs from the app's folder, whose `public/` the export serves.
          publicDirectory: join(process.cwd(), 'public'),
        });
        return [id, body] as const;
      }),
    ),
  );
  return (
    <BeyondCodePageView
      locale={locale}
      sections={sections}
      bodies={bodies}
      channels={channels}
    />
  );
}
