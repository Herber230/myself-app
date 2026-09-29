import { loadProfile } from '@myself-app/domain/use-cases';
import { en } from '@myself-app/implementation-ui/i18n/catalogs';
import {
  isSiteLocale,
  SITE_LOCALES,
} from '@myself-app/implementation-ui/routing';
import {
  renderSocialImage,
  SOCIAL_IMAGE_SIZE,
} from '@myself-app/implementation-ui/social';
import { notFound } from 'next/navigation';

import { SITE_CONTENT } from '../../composition';

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
  return renderSocialImage(locale, await loadProfile(SITE_CONTENT));
}
