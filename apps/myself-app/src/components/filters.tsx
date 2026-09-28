'use client';

/**
 * The controls of a filter kept in the URL (#41, #70): the radar's and the
 * blog's. Chips that toggle a value, a search box, how many are shown, and a
 * way back to everything. They hold no state: each reports what it would
 * change, and the page writes it to the URL.
 */
import { Stack } from '@entifix/react-controls/primitives';
import type { ReactNode } from 'react';

export function FilterFieldset({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="filters">
      <legend className="sr-only">{label}</legend>
      <Stack gap="s">{children}</Stack>
    </fieldset>
  );
}

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
    <div role="group" aria-label={label} className="filter-row">
      <span aria-hidden className="filter-label">
        {label}
      </span>
      {options.map(option => (
        <button
          key={option.key}
          type="button"
          className="landing-chip"
          aria-pressed={selected.includes(option.key)}
          onClick={() => onToggle(option.key)}
        >
          {option.name}
        </button>
      ))}
    </div>
  );
}

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
    <div className="filter-row">
      <label className="filter-search">
        <span className="filter-label">{searchLabel}</span>
        <input
          type="search"
          value={search}
          onChange={event => onSearch(event.currentTarget.value)}
        />
      </label>
      <output aria-live="polite" className="filter-count">
        {showing}
      </output>
      {onClear && (
        <button type="button" className="filter-clear" onClick={onClear}>
          {clearLabel}
        </button>
      )}
    </div>
  );
}
