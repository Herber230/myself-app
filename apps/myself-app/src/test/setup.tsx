/**
 * Every `*.spec.tsx` runs after this, in `jsdom`.
 */
import { cleanup } from '@testing-library/react';
import type { ComponentPropsWithoutRef } from 'react';
import { afterEach, vi } from 'vitest';

// Node 26 declares a `localStorage` of its own, `undefined` unless started
// with `--localstorage-file`, and it hides jsdom's: point it back at the
// document's storage, which the theme reads and writes.
const { window: dom } = (globalThis as unknown as { jsdom: { window: Window } })
  .jsdom;
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: dom.localStorage,
});

// No app router exists outside Next: a `Link` is the anchor it renders.
vi.mock('next/link', () => ({
  default: ({ href, ...props }: ComponentPropsWithoutRef<'a'>) => (
    <a href={href} {...props} />
  ),
}));

// `next/font/local` only exists inside Next's compiler (`src/fonts.ts`).
vi.mock('../fonts', () => ({ fontVariables: 'font-inter font-mono' }));

afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute('data-theme');
  window.localStorage.clear();
  window.location.hash = '';
});
