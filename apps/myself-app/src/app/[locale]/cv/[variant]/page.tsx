import type { Metadata } from 'next';

import { cvMetadata, CvPageView } from '../../../../components/cv/cv-page';
import { cvVariantParams } from '../../../../content/cv';
import { SITE_REPOSITORIES } from '../../../../content/repositories';

/** Every variant but the default, which lives at `/cv/` (ADR 0012). */
export const dynamicParams = false;

export function generateStaticParams() {
  return cvVariantParams(SITE_REPOSITORIES);
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
