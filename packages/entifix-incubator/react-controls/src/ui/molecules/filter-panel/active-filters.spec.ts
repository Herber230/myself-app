import { describe, expect, it, vi } from 'vitest';

import { activeFiltersOf } from './active-filters';

const groups = [
  {
    param: 'ring',
    label: 'Ring',
    options: [
      { key: 'adopt', name: 'Adopt' },
      { key: 'hold', name: 'Hold' },
    ],
  },
  { param: 'area', label: 'Area', options: [{ key: 'css', name: 'CSS' }] },
] as const;

describe('the filters in force', () => {
  it('are every chosen value, in the groups’ and the options’ order, then the search', () => {
    const onToggle = vi.fn();
    const onClearSearch = vi.fn();
    const chosen: Record<string, readonly string[]> = {
      ring: ['hold', 'adopt'],
      area: ['css'],
    };
    const active = activeFiltersOf({
      groups,
      selected: param => chosen[param] as readonly string[],
      search: { label: 'Search', text: 'nx' },
      removeLabel: label => `Remove ${label}`,
      onToggle,
      onClearSearch,
    });
    expect(
      active.map(chip => [chip.key, chip.label, chip.removeLabel]),
    ).toEqual([
      ['ring-adopt', 'Ring: Adopt', 'Remove Ring: Adopt'],
      ['ring-hold', 'Ring: Hold', 'Remove Ring: Hold'],
      ['area-css', 'Area: CSS', 'Remove Area: CSS'],
      ['q', 'Search: “nx”', 'Remove Search: “nx”'],
    ]);
    active[1]?.onRemove();
    expect(onToggle).toHaveBeenCalledWith('ring', 'hold');
    active[3]?.onRemove();
    expect(onClearSearch).toHaveBeenCalledOnce();
  });

  it('leave out an empty search, or none given', () => {
    const base = {
      groups,
      selected: () => [],
      removeLabel: (label: string) => label,
      onToggle: vi.fn(),
      onClearSearch: vi.fn(),
    };
    expect(
      activeFiltersOf({ ...base, search: { label: 'Search', text: '' } }),
    ).toEqual([]);
    expect(activeFiltersOf(base)).toEqual([]);
  });
});
