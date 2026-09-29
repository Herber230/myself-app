import { cvVariantParams } from '@myself-app/domain/use-cases';
import type { Metadata } from 'next';

import { cvMetadata, CvPageView } from '../../../../components/cv/cv-page';
import { SITE_CONTENT } from '../../../../composition';

/** Every variant but the default, which lives at `/cv/` (ADR 0012). */
export const dynamicParams = false;

export function generateStaticParams() {
  return cvVariantParams(SITE_CONTENT);
}

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/cv/[variant]'>): Promise<Metadata> {
  const { locale, variant } = await params;
  return cvMetadata({ locale, variant, mode: 'human' });
}

export default async function CvVariantPage({
  params,
}: PageProps<'/[locale]/cv/[variant]'>) {
  const { locale, variant } = await params;
  return CvPageView({ locale, variant, mode: 'human' });
}
