import { join } from 'node:path';

import type { LocalizedText } from '@myself-app/domain';
import {
  loadPost,
  loadPostIds,
  loadPosts,
  previewsOf,
  relatedPosts,
} from '@myself-app/domain/use-cases';
import { siteT } from '@myself-app/implementation-ui/i18n';
import { outlineOf } from '@myself-app/implementation-ui/markdown';
import {
  inLocale,
  renderPostBody,
} from '@myself-app/implementation-ui/organisms';
import {
  isSiteLocale,
  localeAlternates,
} from '@myself-app/implementation-ui/routing';
import { PostPageView } from '@myself-app/implementation-ui/templates';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { SITE_CONTENT } from '../../../../composition';
import { BLOG_READS } from '../../../../content/blog-reads';
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
 * A post (ADR 0017): what the template shows, read here — its preview, the
 * related ones — and its body and outline, read from its Markdown at build.
 */
export default async function PostPage({
  params,
}: PageProps<'/[locale]/blog/[slug]'>) {
  const { locale, post, id } = await postOf(params);
  const [[preview], posts, sitePaths] = await Promise.all([
    previewsOf(SITE_CONTENT, [post]),
    loadPosts(SITE_CONTENT, BLOG_READS),
    loadSitePaths(SITE_CONTENT),
  ]);
  const markdown = inLocale(post.body as LocalizedText, locale);
  const [related, body, outline] = await Promise.all([
    previewsOf(SITE_CONTENT, relatedPosts(post, posts)),
    renderPostBody({
      id,
      markdown,
      locale,
      sitePaths,
      // The build runs from the app's folder, whose `public/` the export serves.
      publicDirectory: join(process.cwd(), 'public'),
    }),
    outlineOf(markdown, `posts/${id}.${locale}.md`),
  ]);
  return (
    <PostPageView
      locale={locale}
      post={post}
      // Every post has one: it was read from the same repository.
      preview={preview as NonNullable<typeof preview>}
      related={related}
      body={body}
      outline={outline}
    />
  );
}
