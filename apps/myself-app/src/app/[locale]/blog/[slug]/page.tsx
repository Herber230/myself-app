import { join } from 'node:path';

import {
  Cluster,
  linkClassName,
  Stack,
  Text,
} from '@entifix/react-controls/primitives';
import type { LocalizedText } from '@myself-app/domain';
import {
  loadPost,
  loadPostIds,
  loadPostPreviews,
  loadPosts,
  previewsOf,
  relatedPosts,
} from '@myself-app/domain/use-cases';
import { siteT } from '@myself-app/implementation-ui/i18n';
import { FilterLinks } from '@myself-app/implementation-ui/molecules';
import { PostCard } from '@myself-app/implementation-ui/molecules';
import { formatDay, postCardOf } from '@myself-app/implementation-ui/molecules';
import { filterOptionsOf } from '@myself-app/implementation-ui/organisms';
import { renderPostBody } from '@myself-app/implementation-ui/organisms';
import { inLocale } from '@myself-app/implementation-ui/organisms';
import { SiteNav } from '@myself-app/implementation-ui/organisms';
import { technologyPath } from '@myself-app/implementation-ui/routing';
import {
  isSiteLocale,
  localeAlternates,
  localePath,
} from '@myself-app/implementation-ui/routing';
import { BlogLayout } from '@myself-app/implementation-ui/templates';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { SITE_CONTENT } from '../../../../composition';
import { BLOG_PREVIEWS, BLOG_READS } from '../../../../content/blog-reads';
import { loadSitePaths } from '../../../../content/site-paths';

/** One page per post, and no other; a draft only under `next dev`. */
export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = await loadPostIds(SITE_CONTENT, BLOG_READS);
  return posts.map(slug => ({ slug }));
}

async function postOf(params: PageProps<'/[locale]/blog/[slug]'>['params']) {
  const { locale, slug } = await params;
  if (!isSiteLocale(locale)) notFound();
  const post = await loadPost(SITE_CONTENT, slug, BLOG_READS);
  if (post === undefined) notFound();
  return { locale, post, id: slug };
}

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/blog/[slug]'>): Promise<Metadata> {
  const { locale, post, id } = await postOf(params);
  const t = siteT(locale);
  return {
    title: `${inLocale(post.title, locale)} — ${t('blog')} — ${t('siteName')}`,
    description: inLocale(post.summary, locale),
    alternates: localeAlternates(locale, `/blog/${id}`),
    openGraph: {
      type: 'article',
      publishedTime: (post.publishedAt as Date).toISOString(),
      ...(post.updatedAt && { modifiedTime: post.updatedAt.toISOString() }),
    },
  };
}

/**
 * A post (ADR 0017): its body, rendered from Markdown at build, what it is
 * about, and the posts most related to it.
 */
export default async function PostPage({
  params,
}: PageProps<'/[locale]/blog/[slug]'>) {
  const { locale, post, id } = await postOf(params);
  const t = siteT(locale);
  const [[preview], posts, previews, sitePaths] = await Promise.all([
    previewsOf(SITE_CONTENT, [post], BLOG_PREVIEWS),
    loadPosts(SITE_CONTENT, BLOG_READS),
    loadPostPreviews(SITE_CONTENT, BLOG_PREVIEWS),
    loadSitePaths(SITE_CONTENT),
  ]);
  const options = filterOptionsOf(previews, locale);
  const named = (list: readonly { id: string; name: string }[]) =>
    list.map(each => ({ key: each.id, name: each.name }));
  // Every post has one: it was read from the same repository.
  const card = postCardOf(preview as NonNullable<typeof preview>, locale, t);
  const related = await previewsOf(
    SITE_CONTENT,
    relatedPosts(post, posts),
    BLOG_PREVIEWS,
  );
  const body = await renderPostBody({
    id,
    markdown: inLocale(post.body as LocalizedText, locale),
    locale,
    sitePaths,
    // The build runs from the app's folder, whose `public/` the export serves.
    publicDirectory: join(process.cwd(), 'public'),
  });
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
