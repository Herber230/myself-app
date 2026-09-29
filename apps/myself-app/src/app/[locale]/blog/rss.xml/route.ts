import { loadPosts } from '@myself-app/domain/use-cases';
import { notFound } from 'next/navigation';

import { renderFeed } from '../../../../blog/feed';
import { SITE_CONTENT } from '../../../../composition';
import { isSiteLocale, SITE_LOCALES } from '../../../../site-locales';
import { siteUrl } from '../../../../site-url';

/**
 * `/<locale>/blog/rss.xml` (ADR 0017), written once per locale into the
 * export. A route handler's segments are listed here: the layout's
 * `generateStaticParams` does not reach it.
 */
export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return SITE_LOCALES.map(locale => ({ locale }));
}

export async function GET(
  _request: Request,
  { params }: RouteContext<'/[locale]/blog/rss.xml'>,
) {
  const { locale } = await params;
  if (!isSiteLocale(locale)) notFound();
  // The feed never carries a draft, `next dev` or not.
  const posts = await loadPosts(SITE_CONTENT, { includeDrafts: false });
  return new Response(renderFeed(posts, locale, siteUrl()), {
    headers: { 'content-type': 'application/rss+xml; charset=utf-8' },
  });
}
