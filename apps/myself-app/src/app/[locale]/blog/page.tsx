import { loadPostPreviews } from '@myself-app/domain/use-cases';
import { siteT } from '@myself-app/implementation-ui/i18n';
import { postCardOf } from '@myself-app/implementation-ui/molecules';
import { filterOptionsOf } from '@myself-app/implementation-ui/organisms';
import { PostExplorer } from '@myself-app/implementation-ui/organisms';
import { SiteNav } from '@myself-app/implementation-ui/organisms';
import {
  isSiteLocale,
  localeAlternates,
} from '@myself-app/implementation-ui/routing';
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
  const t = siteT(locale);
  const previews = await loadPostPreviews(SITE_CONTENT, BLOG_PREVIEWS);
  const { tags, technologies, years } = filterOptionsOf(previews, locale);
  return (
    <>
      <SiteNav locale={locale} path={PATH} />
      <BrowserSources>
        <PostExplorer
          posts={previews.map(preview => postCardOf(preview, locale, t))}
          locale={locale}
          tags={tags}
          technologies={technologies}
          years={years}
          copy={{
            filters: t('blogPage.filter.label'),
            tag: t('blogPage.filter.tag'),
            technology: t('blogPage.filter.technology'),
            year: t('blogPage.filter.year'),
            search: t('blogPage.filter.search'),
            clear: t('blogPage.filter.clear'),
            showing: t('blogPage.filter.showing', {
              shown: '{{shown}}',
              total: '{{total}}',
            }),
            empty: t('blogPage.empty'),
            showSidebar: t('blogPage.sidebar.show'),
            hideSidebar: t('blogPage.sidebar.hide'),
          }}
          title={t('blog')}
          lead={t('blogLead')}
          feed={{ href: `/${locale}/blog/rss.xml`, label: t('blogPage.feed') }}
        />
      </BrowserSources>
    </>
  );
}
