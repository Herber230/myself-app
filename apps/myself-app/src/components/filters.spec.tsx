import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { FilterFieldset, FilterSummary, toggled, ToggleGroup } from './filters';

describe('toggled', () => {
  it('adds a value, and takes it out again', () => {
    expect(toggled(['a'], 'b')).toEqual(['a', 'b']);
    expect(toggled(['a', 'b'], 'a')).toEqual(['b']);
  });
});

describe('the filter controls', () => {
  it('group their controls under a named fieldset', () => {
    render(
      <FilterFieldset label="Filter the list">
        <p>controls</p>
      </FilterFieldset>,
    );
    expect(screen.getByRole('group', { name: 'Filter the list' })).toBeTruthy();
    expect(screen.getByText('controls')).toBeTruthy();
  });

  it('press the chips selected, and report the one toggled', () => {
    const onToggle = vi.fn();
    render(
      <ToggleGroup
        label="Tag"
        options={[
          { key: 'web', name: 'Web' },
          { key: 'data', name: 'Data' },
        ]}
        selected={['data']}
        onToggle={onToggle}
      />,
    );
    const group = screen.getByRole('group', { name: 'Tag' });
    expect(group).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Data' }).getAttribute('aria-pressed'),
    ).toBe('true');
    expect(
      screen.getByRole('button', { name: 'Web' }).getAttribute('aria-pressed'),
    ).toBe('false');
    fireEvent.click(screen.getByRole('button', { name: 'Web' }));
    expect(onToggle).toHaveBeenCalledWith('web');
  });

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
