import {
  controlsCatalogs,
  type ControlsResources,
} from '@entifix/react-controls/primitives';

import type { SiteLocale } from '../../site-locales';
import type { en } from './en';
import { SITE_CATALOGS } from './site';

/**
 * Every catalog the site renders, per locale: entifix's `controls` namespace
 * (the copy of the primitives it uses, such as the theme switcher's label) and
 * the site's own `site` namespace.
 *
 * `Record<SiteLocale, …>` makes a locale added to `SITE_LOCALES` without a
 * catalog a type error.
 */
export const SITE_RESOURCES = {
  en: { ...controlsCatalogs.en, site: SITE_CATALOGS.en },
  es: { ...controlsCatalogs.es, site: SITE_CATALOGS.es },
} as const satisfies Record<SiteLocale, object>;

/**
 * The single typed-key shape. TypeScript permits one `declare module 'i18next'`
 * per compilation (`TS2717` on a second), so only the host can compose it.
 */
export type Resources = ControlsResources & { site: typeof en };

export type Namespace = keyof Resources;

export const NAMESPACES = [
  'controls',
  'site',
] as const satisfies readonly Namespace[];

/**
 * `controls`, not `site`: entifix's components translate with `useT()` and no
 * namespace, so the default is theirs. The site always names its own
 * (`siteT`), which makes the default irrelevant to it.
 */
export const DEFAULT_NS = 'controls' satisfies Namespace;
