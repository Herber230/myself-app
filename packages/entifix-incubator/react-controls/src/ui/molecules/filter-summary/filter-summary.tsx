'use client';

import { FilterLabel, FilterRow } from '../filter-row/filter-row.js';

/** The search box, the count, and — while filtering — the way back. */
export function FilterSummary({
  searchLabel,
  search,
  onSearch,
  showing,
  clearLabel,
  onClear,
}: {
  searchLabel: string;
  search: string;
  onSearch: (text: string) => void;
  /** What the count says, already filled in. */
  showing: string;
  clearLabel: string;
  /** Absent while nothing is filtered: there is nothing to clear. */
  onClear?: () => void;
}) {
  return (
    <FilterRow>
      <label
        data-slot="filter-search"
        className="flex min-w-0 max-w-[28rem] flex-[1_1_16rem] items-center gap-xs"
      >
        <FilterLabel>{searchLabel}</FilterLabel>
        <input
          type="search"
          value={search}
          onChange={event => onSearch(event.currentTarget.value)}
          className="w-full min-w-0 flex-1 rounded-[4px] border border-border bg-surface px-xs py-[0.125rem] font-[inherit] text-inherit"
        />
      </label>
      <output
        aria-live="polite"
        data-slot="filter-count"
        className="text-content-muted"
      >
        {showing}
      </output>
      {onClear && (
        <button
          type="button"
          data-slot="filter-clear"
          className="cursor-pointer border-0 bg-transparent p-0 font-[inherit] text-primary underline"
          onClick={onClear}
        >
          {clearLabel}
        </button>
      )}
    </FilterRow>
  );
}
