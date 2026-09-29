/**
 * What every CV route loads (ADR 0012): the locale and variant, checked, or
 * not found; the sheet; and every variant, for the switch between them.
 */
import {
  defaultCvVariantId,
  loadCvSheet,
  loadCvVariants,
} from '@myself-app/domain/use-cases';
import type { CvMode } from '@myself-app/implementation-ui/organisms';
import { isSiteLocale } from '@myself-app/implementation-ui/routing';
import type { CvPageData } from '@myself-app/implementation-ui/templates';
import { notFound } from 'next/navigation';

import { SITE_CONTENT } from '../../../composition';

export interface CvRoute {
  readonly locale: string;
  /** Absent on `/cv/` and `/cv/ats/`, which show the default. */
  readonly variant?: string;
  readonly mode: CvMode;
}

export async function loadCvPage({
  locale,
  variant,
  mode,
}: CvRoute): Promise<CvPageData> {
  if (!isSiteLocale(locale)) notFound();
  const defaultVariant = String(await defaultCvVariantId(SITE_CONTENT));
  const variantId = variant ?? defaultVariant;
  const [sheet, variants] = await Promise.all([
    loadCvSheet(SITE_CONTENT, variantId),
    loadCvVariants(SITE_CONTENT),
  ]);
  if (sheet === undefined) notFound();
  return { locale, mode, variantId, defaultVariant, sheet, variants };
}
