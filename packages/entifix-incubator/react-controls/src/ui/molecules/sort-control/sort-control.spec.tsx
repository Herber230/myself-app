import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SortControl } from './sort-control';

const FIELDS = [
  { key: 'number', name: 'Number' },
  { key: 'date', name: 'Date', initial: 'desc' as const },
];

const LABELS = { asc: 'ascending', desc: 'descending' };

describe('a sort control', () => {
  it('marks the chosen field and its direction', () => {
    const { container } = render(
      <SortControl
        label="Sort by"
        fields={FIELDS}
        value={{ field: 'date', direction: 'desc' }}
        directionLabels={LABELS}
        onChange={() => undefined}
      />,
    );
    expect(screen.getByRole('group', { name: 'Sort by' })).toBeTruthy();
    const date = screen.getByRole('button', { name: 'Date, descending' });
    expect(date.getAttribute('aria-pressed')).toBe('true');
    expect(
      screen
        .getByRole('button', { name: 'Number' })
        .getAttribute('aria-pressed'),
    ).toBe('false');
    expect(
      container
        .querySelector('[data-slot="sort-direction"]')
        ?.getAttribute('class'),
    ).toBe('rotate-180');
  });

  it('turns the chosen field around, and starts another in its own direction', () => {
    const onChange = vi.fn();
    const { rerender, container } = render(
      <SortControl
        label="Sort by"
        fields={FIELDS}
        value={{ field: 'number', direction: 'asc' }}
        directionLabels={LABELS}
        onChange={onChange}
      />,
    );
    expect(
      container
        .querySelector('[data-slot="sort-direction"]')
        ?.hasAttribute('class'),
    ).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: 'Number, ascending' }));
    expect(onChange).toHaveBeenLastCalledWith({
      field: 'number',
      direction: 'desc',
    });
    fireEvent.click(screen.getByRole('button', { name: 'Date' }));
    expect(onChange).toHaveBeenLastCalledWith({
      field: 'date',
      direction: 'desc',
    });

    rerender(
      <SortControl
        label="Sort by"
        fields={FIELDS}
        value={{ field: 'number', direction: 'desc' }}
        directionLabels={LABELS}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Number, descending' }));
    expect(onChange).toHaveBeenLastCalledWith({
      field: 'number',
      direction: 'asc',
    });
  });

  it('starts a field with no direction of its own ascending, when nothing is chosen', () => {
    const onChange = vi.fn();
    render(
      <SortControl
        label="Sort by"
        fields={FIELDS}
        value={undefined}
        directionLabels={LABELS}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Number' }));
    expect(onChange).toHaveBeenLastCalledWith({
      field: 'number',
      direction: 'asc',
    });
  });
});
