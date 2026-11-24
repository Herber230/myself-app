import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import OneMonthPage, { metadata } from './page';

describe('the one-month page', () => {
  it('renders the shared page, greeting her', () => {
    render(<OneMonthPage />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
      'Hi Spooky.',
    );
  });

  it('is reached by its link alone: out of search, at its own address', () => {
    expect(metadata.title).toBe('One month');
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.alternates?.canonical).toBe('/for/spooky/one-month/');
  });
});
