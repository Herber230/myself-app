import type { PostPreview } from '@myself-app/domain/use-cases';

import { siteT } from '../../i18n/server.js';
import { postCardOf } from '../../molecules/post-card/post-cards.js';
import { filterOptionsOf } from '../../organisms/post-explorer/filter-options.js';
import { PostExplorer } from '../../organisms/post-explorer/post-explorer.js';
import { SiteNav } from '../../organisms/site-nav/site-nav.js';
import type { SiteLocale } from '../../routing/site-locales.js';

export interface BlogPageData {
  readonly locale: SiteLocale;
  /** Every post, newest first. */
  readonly previews: readonly PostPreview[];
}

/**
 * The blog's home (ADR 0017): every post, newest first, and a filter by tag,
 * technology, year and title that runs in the browser (ADR 0016). The filter
 * reads its posts through `useSources()`: the page mounts the sources.
 */
export function BlogPageView({ locale, previews }: BlogPageData) {
  const t = siteT(locale);
  const { tags, technologies, years } = filterOptionsOf(previews, locale);
  return (
    <>
      <SiteNav locale={locale} path="/blog" />
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
    </>
  );
}
