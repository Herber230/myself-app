import {
  Cluster,
  linkClassName,
  Stack,
  Text,
} from '@entifix/react-controls/primitives';
import type { Post } from '@myself-app/domain';
import type { PostPreview } from '@myself-app/domain/use-cases';
import { FoldScript } from '@myself-app/entifix-incubator-react-controls';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { siteT } from '../../i18n/server.js';
import type { OutlineEntry } from '../../markdown/outline.js';
import { PageHeader } from '../../molecules/page-header/page-header.js';
import { PageOutline } from '../../molecules/page-outline/page-outline.js';
import { PostCard } from '../../molecules/post-card/post-card.js';
import { formatDay, postCardOf } from '../../molecules/post-card/post-cards.js';
import { SiteNav } from '../../organisms/site-nav/site-nav.js';
import { localePath } from '../../routing/locale-path.js';
import { technologyPath } from '../../routing/radar-paths.js';
import type { SiteLocale } from '../../routing/site-locales.js';
import { NOT_WIDE } from '../../theme/breakpoints.js';
import { BlogLayout } from '../blog-layout/blog-layout.js';

export interface PostPageData {
  readonly locale: SiteLocale;
  readonly post: Post;
  /** This post's preview: its date, its reading time, its names. */
  readonly preview: PostPreview;
  /** The posts most related to it (`relatedPosts`). */
  readonly related: readonly PostPreview[];
  /** Its body, rendered from Markdown (`renderPostBody`). */
  readonly body: ReactNode;
  /** Its sections, read from the same Markdown (`outlineOf`). */
  readonly outline: readonly OutlineEntry[];
}

/**
 * A post (ADR 0017): its body, what it is about, and the posts most related
 * to it, beside its table of contents — open beside the article, folded above
 * it on a phone (`FoldScript`).
 */
export function PostPageView({
  locale,
  post,
  preview,
  related,
  body,
  outline,
}: PostPageData) {
  const t = siteT(locale);
  const id = String(post.id);
  const card = postCardOf(preview, locale, t);
  const blogPath = localePath(locale, '/blog');
  // A table of contents is worth a column once there are two sections.
  const sidebar = (
    <Stack gap="l">
      {outline.length >= 2 && (
        <PageOutline
          entries={outline}
          label={t('outline')}
          id="post-outline-label"
        />
      )}
      <Stack gap="2xs">
        <Link href={blogPath} className="blog-feed-link">
          {t('blogPage.back')}
        </Link>
        <a href={`/${locale}/blog/rss.xml`} className="blog-feed-link">
          {t('blogPage.feed')}
        </a>
      </Stack>
    </Stack>
  );
  return (
    <>
      <SiteNav locale={locale} path={`/blog/${id}`} />
      <BlogLayout
        sidebar={sidebar}
        sidebarOpen
        copy={{
          label: t('outline'),
          show: t('blogPage.sidebar.showContents'),
          hide: t('blogPage.sidebar.hideContents'),
        }}
      >
        <Link href={blogPath} className={`${linkClassName} blog-back`}>
          {t('blogPage.back')}
        </Link>
        <article className="blog-article">
          <Stack gap="l">
            <PageHeader
              className="blog-article-header"
              eyebrow={
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
              }
              title={card.title}
            >
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
            </PageHeader>
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
      {/* On a phone the sidebar sits above the article: the post opens on
          its title, its contents a tap away. */}
      <FoldScript
        folds={[{ query: NOT_WIDE, selector: '.blog-sidebar-panel' }]}
      />
    </>
  );
}
