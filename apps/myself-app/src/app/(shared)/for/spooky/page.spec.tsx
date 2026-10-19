import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import SpookyPage, { metadata } from './page';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('the Spooky page', () => {
  it('renders the shared page, asking its question', () => {
    vi.stubGlobal('CSS', { supports: () => true });
    render(<SpookyPage />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain(
      'Spooky?',
    );
  });

  it('is reached by its link alone: out of search, at its own address', () => {
    expect(metadata.title).toBe('Spooky');
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.alternates?.canonical).toBe('/for/spooky/');
  });
});
