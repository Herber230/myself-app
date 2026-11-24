import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ONE_MONTH_COPY } from './copy.js';
import { OneMonthPageView } from './one-month-page.js';

describe('the one-month page', () => {
  it('is one main landmark, holding the story from its cover', () => {
    const { container } = render(<OneMonthPageView />);
    const main = screen.getByRole('main');
    expect(main.classList.contains('month-page')).toBe(true);
    expect(container.querySelector('.month-stage')).not.toBe(null);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
      ONE_MONTH_COPY.cover.greeting,
    );
  });
});
