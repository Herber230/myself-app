'use client';

import { FilterRow } from '../filter-row/filter-row.js';

/** A chip, and pressed: filled with the primary colour. */
const CHIP =
  'inline-block cursor-pointer rounded-full border border-border bg-transparent px-xs py-[0.125rem] font-[inherit] text-[0.875em] text-inherit hover:border-primary hover:text-primary focus-visible:border-primary focus-visible:text-primary aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-surface';

/** Chips that toggle a value of a filter, each reporting the one toggled. */
export function ToggleGroup({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: readonly { readonly key: string; readonly name: string }[];
  selected: readonly string[];
  onToggle: (key: string) => void;
}) {
  return (
    <FilterRow role="group" aria-label={label} label={label}>
      {options.map(option => (
        <button
          key={option.key}
          type="button"
          data-slot="filter-chip"
          className={CHIP}
          aria-pressed={selected.includes(option.key)}
          onClick={() => onToggle(option.key)}
        >
          {option.name}
        </button>
      ))}
    </FilterRow>
  );
}
