/**
 * Every `*.spec.tsx` runs after this, in `jsdom`.
 */
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';

import { installMatchMedia } from './match-media';

// jsdom has no `matchMedia`: a stand-in at a desk's width (`match-media.ts`).
beforeEach(() => installMatchMedia());

afterEach(() => {
  cleanup();
  window.location.hash = '';
});
