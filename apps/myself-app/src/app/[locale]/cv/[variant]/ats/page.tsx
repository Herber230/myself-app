import { cvVariantParams } from '@myself-app/domain/use-cases';
import {
  cvMetadata,
  CvPageView,
} from '@myself-app/implementation-ui/templates';
import type { Metadata } from 'next';

import { SITE_CONTENT } from '../../../../../composition';
import { loadCvPage } from '../../cv-route';

/** A variant, for an applicant tracking system (ADR 0012). */
export const dynamicParams = false;

/** The export needs the variants here too: a page's params are not a layout's. */
export function generateStaticParams() {
  return cvVariantParams(SITE_CONTENT);
}

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/cv/[variant]/ats'>): Promise<Metadata> {
  const { locale, variant } = await params;
  return cvMetadata(await loadCvPage({ locale, variant, mode: 'ats' }));
}

export default async function CvVariantAtsPage({
  params,
}: PageProps<'/[locale]/cv/[variant]/ats'>) {
  const { locale, variant } = await params;
  return CvPageView(await loadCvPage({ locale, variant, mode: 'ats' }));
}
