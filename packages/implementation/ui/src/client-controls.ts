'use client';

/**
 * The client controls a server component renders, crossing into the client
 * graph here rather than through `@entifix/react-controls/primitives`.
 *
 * ⚠️ A server component that imports a `'use client'` export through that
 * barrel puts every client module the barrel re-exports on the page —
 * `ThemeSwitcher`, `ConfirmDialog`, `Pagination` and their Effect, ~45 KB
 * gzipped on the landing page (ADR 0008's budget). Imported from a client
 * module, the barrel is rewritten to the one module used, as
 * `optimizePackageImports` intends. A server component takes a client
 * control from here; a client component may import the barrel directly.
 */
export {
  ActiveHeading,
  ActiveSection,
  KeepSection,
} from '@entifix/react-controls/primitives';
