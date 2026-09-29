import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FilterLabel, FilterRow } from './filter-row';

describe('a filter row', () => {
  it('leads with its label, hidden from assistive technology', () => {
    const { container } = render(
      <FilterRow label="Tag" className="extra">
        <a href="/">web</a>
      </FilterRow>,
    );
    const row = container.firstElementChild as HTMLElement;
    expect(row.dataset.slot).toBe('filter-row');
    expect(row.classList).toContain('extra');
    const label = row.querySelector('[data-slot="filter-label"]');
    expect(label?.textContent).toBe('Tag');
    expect(label?.getAttribute('aria-hidden')).toBe('true');
    expect(screen.getByRole('link').textContent).toBe('web');
  });

  it('can go without a label', () => {
    const { container } = render(<FilterRow>only controls</FilterRow>);
    expect(container.querySelector('[data-slot="filter-label"]')).toBeNull();
  });

  it('lends its label to a control that needs one', () => {
    render(<FilterLabel className="extra">Search</FilterLabel>);
    expect(screen.getByText('Search').classList).toContain('extra');
  });
});
