/**
 * Every `*.spec.tsx` runs after this, in `jsdom`.
 */
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
  window.location.hash = '';
});
