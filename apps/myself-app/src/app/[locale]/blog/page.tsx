import { loadPostPreviews } from '@myself-app/domain/use-cases';
import { siteT } from '@myself-app/implementation-ui/i18n';
import {
  isSiteLocale,
  localeAlternates,
} from '@myself-app/implementation-ui/routing';
import { BlogPageView } from '@myself-app/implementation-ui/templates';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { SITE_CONTENT } from '../../../composition';
import { BLOG_PREVIEWS } from '../../../content/blog-reads';
import { BrowserSources } from '../../../providers/browser-sources';

const PATH = '/blog';

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/blog'>): Promise<Metadata> {
  const { locale } = await params;
  if (!isSiteLocale(locale)) notFound();
  const t = siteT(locale);
  return {
    title: `${t('blog')} — ${t('siteName')}`,
    description: t('blogLead'),
    alternates: {
      ...localeAlternates(locale, PATH),
      types: { 'application/rss+xml': `/${locale}/blog/rss.xml` },
    },
  };
}

/**
 * The blog's home (ADR 0017): every post, newest first, and a filter by tag,
 * technology, year and title that runs in the browser (ADR 0016).
 */
export default async function BlogPage({
  params,
}: PageProps<'/[locale]/blog'>) {
  const { locale } = await params;
  if (!isSiteLocale(locale)) notFound();
  const previews = await loadPostPreviews(SITE_CONTENT, BLOG_PREVIEWS);
  return (
    <BrowserSources>
      <BlogPageView locale={locale} previews={previews} />
    </BrowserSources>
  );
}
