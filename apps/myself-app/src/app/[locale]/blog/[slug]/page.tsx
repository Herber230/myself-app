import {
  Card,
  Center,
  Cluster,
  linkClassName,
  Stack,
  Text,
} from '@entifix/react-controls/primitives';
import type { LocalizedText } from '@myself-app/domain';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { renderPostBody } from '../../../../components/blog/post-body';
import { PostCard } from '../../../../components/blog/post-card';
import { formatDay, postCardOf } from '../../../../components/blog/post-cards';
import { inLocale } from '../../../../components/cv/cv-format';
import { SiteNav } from '../../../../components/site-nav';
import { technologyPath } from '../../../../components/tech-radar/radar-paths';
import {
  loadPost,
  loadPosts,
  previewsOf,
  relatedPosts,
} from '../../../../content/blog';
import { SITE_REPOSITORIES } from '../../../../content/repositories';
import { loadSitePaths } from '../../../../content/site-paths';
import { siteT } from '../../../../i18n/server';
import {
  isSiteLocale,
  localeAlternates,
  localePath,
} from '../../../../site-locales';

/** One page per post, and no other; a draft only under `next dev`. */
export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = await loadPosts(SITE_REPOSITORIES);
  return posts.map(each => ({ slug: String(each.id) }));
}

async function postOf(params: PageProps<'/[locale]/blog/[slug]'>['params']) {
  const { locale, slug } = await params;
  if (!isSiteLocale(locale)) notFound();
  const post = await loadPost(SITE_REPOSITORIES, slug);
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
  const [[preview], posts, sitePaths] = await Promise.all([
    previewsOf(SITE_REPOSITORIES, [post]),
    loadPosts(SITE_REPOSITORIES),
    loadSitePaths(SITE_REPOSITORIES),
  ]);
  // Every post has one: it was read from the same repository.
  const card = postCardOf(preview as NonNullable<typeof preview>, locale, t);
  const related = await previewsOf(
    SITE_REPOSITORIES,
    relatedPosts(post, posts),
  );
  const body = await renderPostBody({
    id,
    markdown: inLocale(post.body as LocalizedText, locale),
    locale,
    sitePaths,
  });
  const blogPath = localePath(locale, '/blog');
  return (
    <>
      <SiteNav locale={locale} path={`/blog/${id}`} />
      <Center as="main" gutters className="py-2xl">
        <Card>
          <article>
            <Stack gap="l">
              <Link href={blogPath} className={linkClassName}>
                {t('blogPage.back')}
              </Link>
              <Stack gap="s">
                <Text as="h1" step={3} weight="semibold">
                  {card.title}
                </Text>
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
                <Cluster gap="xs" aria-label={t('blogPage.tags')}>
                  {card.tags.map(tag => (
                    <Link
                      key={tag.id}
                      href={`${blogPath}?tag=${encodeURIComponent(tag.id)}`}
                      className="landing-chip"
                    >
                      {tag.label}
                    </Link>
                  ))}
                </Cluster>
              </Stack>
              {body}
              {card.technologies.length > 0 && (
                <Stack gap="s">
                  <Text as="h2" step={1} weight="semibold">
                    {t('blogPage.technologies')}
                  </Text>
                  <Cluster gap="xs">
                    {card.technologies.map(technology => (
                      <Link
                        key={technology.id}
                        href={technologyPath(locale, technology.id)}
                        className="landing-chip"
                      >
                        {technology.name}
                      </Link>
                    ))}
                  </Cluster>
                </Stack>
              )}
              {related.length > 0 && (
                <Stack gap="s">
                  <Text as="h2" step={1} weight="semibold">
                    {t('blogPage.related')}
                  </Text>
                  <ol className="post-list">
                    {related.map(each => (
                      <li key={each.id}>
                        <PostCard
                          post={postCardOf(each, locale, t)}
                          heading="h3"
                        />
                      </li>
                    ))}
                  </ol>
                </Stack>
              )}
            </Stack>
          </article>
        </Card>
      </Center>
    </>
  );
}
