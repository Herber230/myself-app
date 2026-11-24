import { defineCatalogs } from '@entifix/i18n';

import { SITE_DEFAULT_LOCALE, SITE_LOCALES } from '../routing/site-locales.js';
import { DEFAULT_NS, NAMESPACES, SITE_RESOURCES } from './catalogs/index.js';

/**
 * Installs the site's catalogs into `@entifix/i18n`. Importing this module is
 * the act of installing.
 *
 * ⚠️ **Once per bundle, not once per app.** The server graph (`server.ts`) and
 * the client graph (`providers.tsx`) are separate bundles with separate module
 * state, so each imports this file. `defineCatalogs` is idempotent.
 *
 * It also declares the site's locales to entifix (`defineLocales`, through
 * the catalogs): entifix knows none of its own, and every control that
 * formats, negotiates or falls back reads them from here.
 */
defineCatalogs({
  resources: SITE_RESOURCES,
  namespaces: NAMESPACES,
  defaultNS: DEFAULT_NS,
  locales: SITE_LOCALES,
  defaultLocale: SITE_DEFAULT_LOCALE,
});
