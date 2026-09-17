// Type-only, so a `declare module` below resolves against the installed
// i18next rather than declaring a new module.
import type {} from 'i18next';

import type { DEFAULT_NS, Resources } from './catalogs';

/**
 * The typed-key gate: `t('site:cvLeed')` is a compile error in every file.
 */
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof DEFAULT_NS;
    resources: Resources;
  }
}
