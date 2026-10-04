import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ActiveFilters, FilterPanel } from './filter-panel';

describe('a filter panel', () => {
  it('names itself, counts what is in force, and keeps its footer in view', () => {
    const { container } = render(
      <FilterPanel
        title="Filters"
        icon={<svg data-testid="icon" />}
        activeLabel="2 active"
        open
        footer={<p>Search</p>}
      >
        <p>Rows</p>
      </FilterPanel>,
    );
    expect(screen.getByText('Filters')).toBeTruthy();
    expect(screen.getByTestId('icon')).toBeTruthy();
    expect(screen.getByText('2 active')).toBeTruthy();
    expect(container.querySelector('details')?.open).toBe(true);
    expect(
      container.querySelector('[data-slot="filter-panel-footer"]')?.textContent,
    ).toBe('Search');
  });

  it('starts closed, with no icon, count or footer', () => {
    const { container } = render(
      <FilterPanel title="Filters">
        <p>Rows</p>
      </FilterPanel>,
    );
    expect(container.querySelector('details')?.open).toBe(false);
    for (const slot of ['icon', 'count', 'footer'])
      expect(
        container.querySelector(`[data-slot="filter-panel-${slot}"]`),
      ).toBeNull();
  });
});

describe('the active filters', () => {
  it('are chips that each remove their value', () => {
    const onRemove = vi.fn();
    render(
      <ActiveFilters
        active={[
          {
            key: 'ring-adopt',
            label: 'Ring: Adopt',
            removeLabel: 'Remove Ring: Adopt',
            onRemove,
          },
        ]}
      />,
    );
    const chip = screen.getByRole('button', { name: 'Remove Ring: Adopt' });
    expect(chip.textContent).toBe('Ring: Adopt');
    fireEvent.click(chip);
    expect(onRemove).toHaveBeenCalledOnce();
  });
});
