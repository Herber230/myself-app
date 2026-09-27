import { localize, type LocalizedText } from '@myself-app/domain';
import { notFound } from 'next/navigation';

import { loadPost, loadPosts } from '../../../../content/blog';
import { SITE_REPOSITORIES } from '../../../../content/repositories';
import { en } from '../../../../i18n/catalogs/en';
import { isSiteLocale, SITE_LOCALES } from '../../../../site-locales';
import { renderSocialImage, SOCIAL_IMAGE_SIZE } from '../../../../social-image';

/** Written once per post and locale at build (ADR 0017). */
export const dynamic = 'force-static';

/** Every segment of a metadata image route is listed here (ADR 0001). */
export async function generateStaticParams() {
  const posts = await loadPosts(SITE_REPOSITORIES);
  return SITE_LOCALES.flatMap(locale =>
    posts.map(post => ({ locale, slug: String(post.id) })),
  );
}

export const size = SOCIAL_IMAGE_SIZE;
export const contentType = 'image/png';
/** An `alt` export cannot vary by locale or post. */
export const alt = `${en.siteName} — ${en.blog}`;

export default async function PostImage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isSiteLocale(locale)) notFound();
  const post = await loadPost(SITE_REPOSITORIES, slug);
  if (post === undefined) notFound();
  return renderSocialImage(locale, {
    title: localize(post.title as LocalizedText, locale),
  });
}
