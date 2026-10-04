import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ToggleGroup } from './toggle-group';

describe('a toggle group', () => {
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
});

describe('a toggle group’s chips', () => {
  const options = [
    {
      key: 'adopt',
      name: 'Adopt',
      swatch: 'red',
      description: 'In production, chosen again.',
    },
    { key: 'hold', name: 'Hold', swatch: 'grey' },
  ];

  it('dot an unpressed chip, check a pressed one, and describe each', () => {
    const { container } = render(
      <ToggleGroup
        label="Ring"
        options={options}
        selected={['adopt']}
        onToggle={vi.fn()}
      />,
    );
    const adopt = screen.getByRole('button', { name: 'Adopt' });
    expect(adopt.querySelector('[data-slot="filter-chip-check"]')).toBeTruthy();
    expect(adopt.querySelector('[data-slot="filter-chip-swatch"]')).toBeNull();
    const tooltip = screen.getByRole('tooltip');
    expect(adopt.getAttribute('aria-describedby')).toBe(tooltip.id);
    expect(tooltip.textContent).toBe('In production, chosen again.');
    const hold = screen.getByRole('button', { name: 'Hold' });
    expect(
      (hold.querySelector('[data-slot="filter-chip-swatch"]') as HTMLElement)
        .style.background,
    ).toBe('grey');
    expect(hold.hasAttribute('aria-describedby')).toBe(false);
    expect(container.querySelector('[data-slot="filter-note"]')).toBeNull();
  });

  it('say under them what the pressed ones mean', () => {
    render(
      <ToggleGroup
        label="Ring"
        options={options}
        selected={[]}
        onToggle={vi.fn()}
        note={<p>Adopt: in production.</p>}
      />,
    );
    expect(screen.getByText('Adopt: in production.')).toBeTruthy();
  });
});
