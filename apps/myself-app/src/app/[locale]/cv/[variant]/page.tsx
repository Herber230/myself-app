import { cvVariantParams } from '@myself-app/domain/use-cases';
import {
  cvMetadata,
  CvPageView,
} from '@myself-app/implementation-ui/templates';
import type { Metadata } from 'next';

import { SITE_CONTENT } from '../../../../composition';
import { loadCvPage } from '../cv-route';

/** Every variant but the default, which lives at `/cv/` (ADR 0012). */
export const dynamicParams = false;

export function generateStaticParams() {
  return cvVariantParams(SITE_CONTENT);
}

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/cv/[variant]'>): Promise<Metadata> {
  const { locale, variant } = await params;
  return cvMetadata(await loadCvPage({ locale, variant, mode: 'human' }));
}

export default async function CvVariantPage({
  params,
}: PageProps<'/[locale]/cv/[variant]'>) {
  const { locale, variant } = await params;
  return CvPageView(await loadCvPage({ locale, variant, mode: 'human' }));
}
