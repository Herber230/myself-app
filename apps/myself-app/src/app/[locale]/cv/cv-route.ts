/**
 * What every CV route loads (ADR 0012): the locale and variant, checked, or
 * not found; the sheet; and every variant, for the switch between them.
 */
import {
  defaultCvVariantId,
  loadCvSheet,
  loadCvVariants,
} from '@myself-app/domain/use-cases';
import { notFound } from 'next/navigation';

import type { CvMode } from '../../../components/cv/cv-format';
import type { CvPageData } from '../../../components/cv/cv-page';
import { SITE_CONTENT } from '../../../composition';
import { isSiteLocale } from '../../../site-locales';

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
