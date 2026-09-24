import type { Metadata } from 'next';

import { cvMetadata, CvPageView } from '../../../../components/cv/cv-page';

/** The default variant, for an applicant tracking system (ADR 0012). */
export async function generateMetadata({
  params,
}: PageProps<'/[locale]/cv/ats'>): Promise<Metadata> {
  const { locale } = await params;
  return cvMetadata({ locale, mode: 'ats' });
}

export default async function CvAtsPage({
  params,
}: PageProps<'/[locale]/cv/ats'>) {
  const { locale } = await params;
  return CvPageView({ locale, mode: 'ats' });
}
