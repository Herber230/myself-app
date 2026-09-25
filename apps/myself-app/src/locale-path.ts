/**
 * A site path under a locale, apart from `site-locales.ts` on purpose: that
 * module re-exports from `@myself-app/domain`, whose barrel carries every
 * entity and Effect with it (`sideEffects: true`), so a client component that
 * imported a path from there would ship them (ADR 0003). This one imports
 * nothing but a type.
 */
import type { SiteLocale } from '@myself-app/domain';

/**
 * A site path under a locale, with the trailing slash the export writes
 * (`/en/cv/`). `path` is locale-free and starts with `/`.
 */
export function localePath(locale: SiteLocale, path: string): string {
  const trimmed = path.replace(/^\/+|\/+$/g, '');
  return trimmed === '' ? `/${locale}/` : `/${locale}/${trimmed}/`;
}
