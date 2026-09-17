'use client';

import { ThemeSwitcher } from '@entifix/react-controls/primitives';
import { useSyncExternalStore } from 'react';

const subscribe = () => () => undefined;

/**
 * entifix's `ThemeSwitcher`, rendered once the page is hydrated.
 *
 * The export is built without knowing a visitor's theme, so a switcher in the
 * static HTML would show `light` checked for everyone and hydrate against a
 * provider that already holds the painted theme. Rendering it on the client
 * only keeps the markup and the state from disagreeing.
 */
export function SiteThemeSwitcher() {
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  return hydrated ? <ThemeSwitcher /> : null;
}
