import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { FilterSummary } from './filter-summary';

describe('a filter summary', () => {
  it('report the search typed, show the count, and clear while filtering', () => {
    const onSearch = vi.fn();
    const onClear = vi.fn();
    const { rerender } = render(
      <FilterSummary
        searchLabel="Search"
        search="ne"
        onSearch={onSearch}
        showing="Showing 2 of 9"
        clearLabel="Show everything"
        onClear={onClear}
      />,
    );
    expect(
      (screen.getByRole('searchbox', { name: 'Search' }) as HTMLInputElement)
        .value,
    ).toBe('ne');
    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: 'next' },
    });
    expect(onSearch).toHaveBeenCalledWith('next');
    expect(screen.getByText('Showing 2 of 9')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Show everything' }));
    expect(onClear).toHaveBeenCalled();

    rerender(
      <FilterSummary
        searchLabel="Search"
        search=""
        onSearch={onSearch}
        showing="Showing 9 of 9"
        clearLabel="Show everything"
      />,
    );
    expect(
      screen.queryByRole('button', { name: 'Show everything' }),
    ).toBeNull();
  });
});
