import '@myself-app/implementation-ui/shared-pages/spooky-page/spooky.css';

import {
  SPOOKY_COPY,
  SpookyPageView,
} from '@myself-app/implementation-ui/shared-pages';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: SPOOKY_COPY.title,
  description: SPOOKY_COPY.description,
  alternates: { canonical: '/for/spooky/' },
  robots: { index: false, follow: false },
};

/** Quantum entanglement as two ghosts (a shared page). */
export default function SpookyPage() {
  return <SpookyPageView />;
}
