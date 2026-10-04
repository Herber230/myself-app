'use client';

import { type ReactNode, useId } from 'react';

import {
  FILTER_ROW,
  FILTER_ROW_LABEL,
  FILTER_ROW_OPTIONS,
} from '../filter-row/filter-row.js';

/**
 * The search box, the count, and — while filtering — the way back. Laid out as
 * a `FilterRow`: the search's label in the label column, the rest after it.
 */
export function FilterSummary({
  searchLabel,
  search,
  onSearch,
  placeholder,
  showing,
  clearLabel,
  onClear,
  children,
}: {
  searchLabel: string;
  search: string;
  onSearch: (text: string) => void;
  /** An example of what to type, shown while the box is empty. */
  placeholder?: string;
  /** What the count says, already filled in. */
  showing: string;
  clearLabel: string;
  /** Absent while nothing is filtered: there is nothing to clear. */
  onClear?: () => void;
  /** Between the count and the way back: what is in force, say. */
  children?: ReactNode;
}) {
  const id = useId();
  return (
    <div data-slot="filter-row" className={FILTER_ROW}>
      <label
        htmlFor={id}
        data-slot="filter-label"
        className={`${FILTER_ROW_LABEL} text-content-muted`}
      >
        {searchLabel}
      </label>
      <div
        data-slot="filter-options"
        className={`${FILTER_ROW_OPTIONS} flex min-w-0 flex-wrap items-center gap-x-s gap-y-2xs`}
      >
        <span
          data-slot="filter-search"
          className="relative flex min-w-0 max-w-[28rem] flex-[1_1_14rem] items-center"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            data-slot="filter-search-icon"
            className="pointer-events-none absolute left-[0.625rem] size-[0.875rem] fill-none stroke-current stroke-[1.5] text-content-muted [stroke-linecap:round]"
          >
            <circle cx="7" cy="7" r="4.5" />
            <path d="m10.5 10.5 3 3" />
          </svg>
          <input
            id={id}
            type="search"
            value={search}
            placeholder={placeholder}
            onChange={event => onSearch(event.currentTarget.value)}
            className="focus-ring h-[2rem] w-full min-w-0 flex-1 rounded-md border border-border bg-surface py-0 pr-xs pl-[2rem] font-[inherit] text-inherit transition-[border-color] duration-(--duration-fast,150ms) placeholder:text-content-muted placeholder:opacity-70 hover:border-content-muted focus:border-primary"
          />
        </span>
        <output
          aria-live="polite"
          data-slot="filter-count"
          className="whitespace-nowrap text-content-muted tabular-nums"
        >
          {showing}
        </output>
        {children}
        {onClear && (
          <button
            type="button"
            data-slot="filter-clear"
            className="focus-ring inline-flex h-[1.75rem] cursor-pointer whitespace-nowrap items-center gap-3xs rounded-full border border-border bg-transparent px-xs font-[inherit] text-[0.875em] text-content transition-[border-color,color] duration-(--duration-fast,150ms) hover:border-primary hover:text-primary"
            onClick={onClear}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              className="size-[0.75rem] fill-none stroke-current stroke-2 [stroke-linecap:round]"
            >
              <path d="m4 4 8 8m0-8-8 8" />
            </svg>
            {clearLabel}
          </button>
        )}
      </div>
    </div>
  );
}
