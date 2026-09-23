/**
 * Rendering Next's route files in a spec. Pages and layouts are async server
 * components: each is awaited first, and its result rendered as any element
 * is, inside the providers every page gets from its layout.
 */
import { render } from '@testing-library/react';
import type { ReactNode } from 'react';

import { Providers } from '../app/[locale]/providers';
import type { SiteLocale } from '../site-locales';

export async function renderPage(page: Promise<ReactNode>, locale: SiteLocale) {
  return render(
    <Providers
      locale={locale}
      themeLabels={{ blue: 'Blue', light: 'Light', dark: 'Dark' }}
    >
      {await page}
    </Providers>,
  );
}

/** A route's `params`, as Next passes them: a promise. */
export function paramsOf<T extends object>(params: T) {
  return { params: Promise.resolve(params) };
}
