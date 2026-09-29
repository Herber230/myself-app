/**
 * Rendering in a spec, inside the providers every page gets from its layout.
 * A template may be an async server component: it is awaited first, and its
 * result rendered as any element is.
 */
import { render, type RenderResult } from '@testing-library/react';
import type { ReactNode } from 'react';

import { Providers } from '../providers/providers.js';
import type { SiteLocale } from '../routing/site-locales.js';

export async function renderPage(
  page: Promise<ReactNode>,
  locale: SiteLocale,
): Promise<RenderResult> {
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
