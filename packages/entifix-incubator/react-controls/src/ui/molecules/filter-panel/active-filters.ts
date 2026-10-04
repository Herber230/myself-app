import type { ActiveFilter } from './filter-panel.js';

/** A row of the filter: its parameter, its name, and the values it offers. */
export interface ActiveFilterGroup<Param extends string> {
  readonly param: Param;
  /** The row's name: `Ring`. */
  readonly label: string;
  readonly options: readonly { readonly key: string; readonly name: string }[];
}

/**
 * What is in force, as `ActiveFilters` chips: every chosen value of every
 * group, in the groups' and the options' order, then the search. Each chip is
 * labelled `Group: Value` and removes its value.
 */
export function activeFiltersOf<Param extends string>({
  groups,
  selected,
  search,
  removeLabel,
  onToggle,
  onClearSearch,
}: {
  groups: readonly ActiveFilterGroup<Param>[];
  /** The values chosen for a parameter. */
  selected: (param: Param) => readonly string[];
  /** The search's name and its text; no chip while the text is empty. */
  search?: { readonly label: string; readonly text: string };
  /** The remove button's accessible name, from the chip's label. */
  removeLabel: (label: string) => string;
  onToggle: (param: Param, key: string) => void;
  onClearSearch: () => void;
}): ActiveFilter[] {
  const active: ActiveFilter[] = [];
  for (const group of groups) {
    const chosen = selected(group.param);
    for (const option of group.options)
      if (chosen.includes(option.key)) {
        const label = `${group.label}: ${option.name}`;
        active.push({
          key: `${group.param}-${option.key}`,
          label,
          removeLabel: removeLabel(label),
          onRemove: () => onToggle(group.param, option.key),
        });
      }
  }
  if (search !== undefined && search.text !== '') {
    const label = `${search.label}: “${search.text}”`;
    active.push({
      key: 'q',
      label,
      removeLabel: removeLabel(label),
      onRemove: onClearSearch,
    });
  }
  return active;
}
