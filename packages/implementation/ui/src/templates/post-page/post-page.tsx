import {
  Cluster,
  linkClassName,
  Stack,
  Text,
} from '@entifix/react-controls/primitives';
import type { Post } from '@myself-app/domain';
import type { PostPreview } from '@myself-app/domain/use-cases';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { siteT } from '../../i18n/server.js';
import { FilterLinks } from '../../molecules/filter-links/filter-links.js';
import { PostCard } from '../../molecules/post-card/post-card.js';
import { formatDay, postCardOf } from '../../molecules/post-card/post-cards.js';
import { filterOptionsOf } from '../../organisms/post-explorer/filter-options.js';
import { SiteNav } from '../../organisms/site-nav/site-nav.js';
import { localePath } from '../../routing/locale-path.js';
import { technologyPath } from '../../routing/radar-paths.js';
import type { SiteLocale } from '../../routing/site-locales.js';
import { BlogLayout } from '../blog-layout/blog-layout.js';

export interface PostPageData {
  readonly locale: SiteLocale;
  readonly post: Post;
  /** This post's preview: its date, its reading time, its names. */
  readonly preview: PostPreview;
  /** Every post's, for the filter in the sidebar. */
  readonly previews: readonly PostPreview[];
  /** The posts most related to it (`relatedPosts`). */
  readonly related: readonly PostPreview[];
  /** Its body, rendered from Markdown (`renderPostBody`). */
  readonly body: ReactNode;
}

/**
 * A post (ADR 0017): its body, what it is about, and the posts most related
 * to it, beside a filter whose links lead back to the blog's home.
 */
export function PostPageView({
  locale,
  post,
  preview,
  previews,
  related,
  body,
}: PostPageData) {
  const t = siteT(locale);
  const id = String(post.id);
  const options = filterOptionsOf(previews, locale);
  const named = (list: readonly { id: string; name: string }[]) =>
    list.map(each => ({ key: each.id, name: each.name }));
  const card = postCardOf(preview, locale, t);
  const blogPath = localePath(locale, '/blog');
  const sidebar = (
    <Stack gap="l">
      <Stack gap="s">
        <h2 className="blog-sidebar-heading">{t('blogPage.filter.label')}</h2>
        <FilterLinks
          blogPath={blogPath}
          groups={[
            {
              param: 'tag',
              label: t('blogPage.filter.tag'),
              options: named(options.tags),
            },
            {
              param: 'tech',
              label: t('blogPage.filter.technology'),
              options: named(options.technologies),
            },
            {
              param: 'year',
              label: t('blogPage.filter.year'),
              options: options.years.map(year => ({ key: year, name: year })),
            },
          ]}
        />
      </Stack>
      <a href={`/${locale}/blog/rss.xml`} className="blog-feed-link">
        {t('blogPage.feed')}
      </a>
    </Stack>
  );
  return (
    <>
      <SiteNav locale={locale} path={`/blog/${id}`} />
      <BlogLayout
        sidebar={sidebar}
        sidebarOpen={false}
        copy={{
          label: t('blogPage.filter.label'),
          show: t('blogPage.sidebar.show'),
          hide: t('blogPage.sidebar.hide'),
        }}
      >
        <Link href={blogPath} className={`${linkClassName} blog-back`}>
          {t('blogPage.back')}
        </Link>
        <article className="blog-article">
          <Stack gap="l">
            <header className="blog-article-header">
              <Stack gap="s">
                <p className="post-card-meta">
                  <time dateTime={card.publishedAt}>{card.date}</time>
                  {post.updatedAt && (
                    <time dateTime={post.updatedAt.toISOString()}>
                      {t('blogPage.updated', {
                        date: formatDay(post.updatedAt, locale),
                      })}
                    </time>
                  )}
                  <span>{card.readingTime}</span>
                  {card.draft && (
                    <span className="post-card-draft">{card.draft}</span>
                  )}
                </p>
                <Text as="h1" step={3} weight="semibold">
                  {card.title}
                </Text>
                <Cluster gap="xs" aria-label={t('blogPage.tags')}>
                  {card.tags.map(tag => (
                    <Link
                      key={tag.id}
                      href={`${blogPath}?tag=${encodeURIComponent(tag.id)}`}
                      className="landing-chip post-chip-tag"
                    >
                      {tag.label}
                    </Link>
                  ))}
                </Cluster>
              </Stack>
            </header>
            {body}
            {card.technologies.length > 0 && (
              <footer className="blog-article-footer">
                <Stack gap="s">
                  <Text as="h2" step={1} weight="semibold">
                    {t('blogPage.technologies')}
                  </Text>
                  <Cluster gap="xs">
                    {card.technologies.map(technology => (
                      <Link
                        key={technology.id}
                        href={technologyPath(locale, technology.id)}
                        className="landing-chip post-chip-tech"
                      >
                        {technology.name}
                      </Link>
                    ))}
                  </Cluster>
                </Stack>
              </footer>
            )}
          </Stack>
        </article>
        {related.length > 0 && (
          <section className="blog-related">
            <Stack gap="s">
              <Text as="h2" step={1} weight="semibold">
                {t('blogPage.related')}
              </Text>
              <ol className="post-list">
                {related.map(each => (
                  <li key={each.id}>
                    <PostCard post={postCardOf(each, locale, t)} heading="h3" />
                  </li>
                ))}
              </ol>
            </Stack>
          </section>
        )}
      </BlogLayout>
    </>
  );
}
