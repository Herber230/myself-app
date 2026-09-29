import { Technology } from '@myself-app/domain';
import {
  loadPostsForTechnology,
  loadTechnologyDetail,
} from '@myself-app/domain/use-cases';
import { siteT } from '@myself-app/implementation-ui/i18n';
import { inLocale } from '@myself-app/implementation-ui/organisms';
import {
  isSiteLocale,
  localeAlternates,
} from '@myself-app/implementation-ui/routing';
import { TechnologyPageView } from '@myself-app/implementation-ui/templates';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { SITE_CONTENT } from '../../../../composition';
import { BLOG_READS } from '../../../../content/blog-reads';

/** One page per technology, and no other (#42, ADR 0014). */
export const dynamicParams = false;

export async function generateStaticParams() {
  const technologies = await SITE_CONTENT.ids(Technology);
  return technologies.map(technology => ({ technology }));
}

async function detailOf(
  params: PageProps<'/[locale]/tech-radar/[technology]'>['params'],
) {
  const { locale, technology } = await params;
  if (!isSiteLocale(locale)) notFound();
  const detail = await loadTechnologyDetail(SITE_CONTENT, technology);
  if (detail === undefined) notFound();
  return { locale, detail };
}

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/tech-radar/[technology]'>): Promise<Metadata> {
  const { locale, detail } = await detailOf(params);
  const t = siteT(locale);
  const name = inLocale(detail.technology.name, locale);
  return {
    title: `${name} — ${t('techRadar')} — ${t('siteName')}`,
    description: inLocale(detail.technology.description, locale),
    alternates: localeAlternates(
      locale,
      `/tech-radar/${String(detail.technology.id)}`,
    ),
  };
}

/** A technology's page (#42): the template, with its posts. */
export default async function TechnologyPage({
  params,
}: PageProps<'/[locale]/tech-radar/[technology]'>) {
  const { locale, detail } = await detailOf(params);
  const posts = await loadPostsForTechnology(
    SITE_CONTENT,
    String(detail.technology.id),
    BLOG_READS,
  );
  return <TechnologyPageView locale={locale} detail={detail} posts={posts} />;
}
