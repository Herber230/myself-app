import type { SiteLocale } from '../../site-locales';
import { en } from './en';
import { es } from './es';

/**
 * The `site` namespace in every site locale. `Record<SiteLocale, …>` makes a
 * locale added to `SITE_LOCALES` without a catalog a type error.
 *
 * Kept apart from `index.ts`, which also merges entifix's catalogs, so the
 * parity spec reads the site's copy without loading the React primitives.
 */
export const SITE_CATALOGS = { en, es } as const satisfies Record<
  SiteLocale,
  object
>;
