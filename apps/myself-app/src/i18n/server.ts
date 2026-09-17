import './install';

import { getServerTFor } from '@entifix/i18n';
import type { TFunction } from 'i18next';

import type { SiteLocale } from '../site-locales';

/**
 * The `site` namespace's translate function for a locale the page already
 * holds from its route params.
 *
 * `getServerTFor`, never `getServerT`: the latter reads a request header, which
 * a static export does not have, and would fail the build.
 *
 * ⚠️ The return type is load-bearing. `getServerTFor` declares
 * `TFunction<'translation' | N>`, and a union with the undeclared `translation`
 * namespace accepts any string, so a mistyped key compiled. Narrowed to `site`,
 * `t('cvLeed')` is a type error again ("Did you mean 'cvLead'?").
 */
export function siteT(locale: SiteLocale): TFunction<'site'> {
  // Sound at runtime: the function is fixed to the `site` namespace.
  return getServerTFor(locale, 'site') as unknown as TFunction<'site'>;
}
