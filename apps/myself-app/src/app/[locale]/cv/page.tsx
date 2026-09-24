import type { Metadata } from 'next';

import { cvMetadata, CvPageView } from '../../../components/cv/cv-page';

/** The default variant, for people (ADR 0012). */
export async function generateMetadata({
  params,
}: PageProps<'/[locale]/cv'>): Promise<Metadata> {
  const { locale } = await params;
  return cvMetadata({ locale, mode: 'human' });
}

export default async function CvPage({ params }: PageProps<'/[locale]/cv'>) {
  const { locale } = await params;
  return CvPageView({ locale, mode: 'human' });
}
