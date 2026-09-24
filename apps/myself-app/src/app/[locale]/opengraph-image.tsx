import { notFound } from 'next/navigation';

import { en } from '../../i18n/catalogs/en';
import { isSiteLocale, SITE_LOCALES } from '../../site-locales';
import { renderSocialImage, SOCIAL_IMAGE_SIZE } from '../../social-image';

/** Written once per locale at build (ADR 0001). */
export const dynamic = 'force-static';

/**
 * A static export needs every segment of a metadata image route listed here;
 * the layout's own `generateStaticParams` does not reach it.
 */
export function generateStaticParams() {
  return SITE_LOCALES.map(locale => ({ locale }));
}

export const size = SOCIAL_IMAGE_SIZE;
export const contentType = 'image/png';
/** A name, and the same in every locale; an `alt` export cannot vary by it. */
export const alt = en.siteName;

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isSiteLocale(locale)) notFound();
  return renderSocialImage(locale);
}
