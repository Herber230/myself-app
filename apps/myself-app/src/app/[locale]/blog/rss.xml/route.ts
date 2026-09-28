import { notFound } from 'next/navigation';

import { renderFeed } from '../../../../blog/feed';
import { SITE_REPOSITORIES } from '../../../../content/repositories';
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
  return new Response(await renderFeed(SITE_REPOSITORIES, locale, siteUrl()), {
    headers: { 'content-type': 'application/rss+xml; charset=utf-8' },
  });
}
