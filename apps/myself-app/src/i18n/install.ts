import { defineCatalogs } from '@entifix/i18n';

import { DEFAULT_NS, NAMESPACES, SITE_RESOURCES } from './catalogs';

/**
 * Installs the site's catalogs into `@entifix/i18n`. Importing this module is
 * the act of installing.
 *
 * ⚠️ **Once per bundle, not once per app.** The server graph (`server.ts`) and
 * the client graph (`providers.tsx`) are separate bundles with separate module
 * state, so each imports this file. `defineCatalogs` is idempotent.
 */
defineCatalogs({
  resources: SITE_RESOURCES,
  namespaces: NAMESPACES,
  defaultNS: DEFAULT_NS,
});
