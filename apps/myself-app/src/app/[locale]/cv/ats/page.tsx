import {
  cvMetadata,
  CvPageView,
} from '@myself-app/implementation-ui/templates';
import type { Metadata } from 'next';

import { loadCvPage } from '../cv-route';

/** The default variant, for an applicant tracking system (ADR 0012). */
export async function generateMetadata({
  params,
}: PageProps<'/[locale]/cv/ats'>): Promise<Metadata> {
  const { locale } = await params;
  return cvMetadata(await loadCvPage({ locale, mode: 'ats' }));
}

export default async function CvAtsPage({
  params,
}: PageProps<'/[locale]/cv/ats'>) {
  const { locale } = await params;
  return CvPageView(await loadCvPage({ locale, mode: 'ats' }));
}
