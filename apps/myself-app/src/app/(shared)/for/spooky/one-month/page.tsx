import '@myself-app/implementation-ui/shared-pages/one-month-page/one-month.css';

import {
  ONE_MONTH_COPY,
  OneMonthPageView,
} from '@myself-app/implementation-ui/shared-pages';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: ONE_MONTH_COPY.title,
  description: ONE_MONTH_COPY.description,
  alternates: { canonical: '/for/spooky/one-month/' },
  robots: { index: false, follow: false },
};

/** How we started, one card at a time (a shared page). */
export default function OneMonthPage() {
  return <OneMonthPageView />;
}
