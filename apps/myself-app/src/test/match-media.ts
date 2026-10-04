/**
 * jsdom has no `matchMedia`. The app's pages are checked at a desk's width,
 * never resized (the UI package's specs resize): a query for at least a width
 * matches, one for less does not.
 */
import { vi } from 'vitest';

export function installMatchMedia() {
  vi.stubGlobal('matchMedia', (media: string) => ({
    media,
    matches: /min-width|>=/.test(media),
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  }));
}
