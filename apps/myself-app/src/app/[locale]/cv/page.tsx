import {
  cvMetadata,
  CvPageView,
} from '@myself-app/implementation-ui/templates';
import type { Metadata } from 'next';

import { loadCvPage } from './cv-route';

/** The default variant, for people (ADR 0012). */
export async function generateMetadata({
  params,
}: PageProps<'/[locale]/cv'>): Promise<Metadata> {
  const { locale } = await params;
  return cvMetadata(await loadCvPage({ locale, mode: 'human' }));
}

export default async function CvPage({ params }: PageProps<'/[locale]/cv'>) {
  const { locale } = await params;
  return CvPageView(await loadCvPage({ locale, mode: 'human' }));
}
