'use client';

import { FilterRow } from '../filter-row/filter-row.js';

export type SortDirection = 'asc' | 'desc';

/** One order chosen: a field, and which way it runs. */
export interface SortChoice {
  readonly field: string;
  readonly direction: SortDirection;
}

/** A chip, and chosen: outlined in the primary colour. */
const CHIP =
  'inline-flex cursor-pointer items-center gap-[0.25em] rounded-full border border-border bg-transparent px-xs py-[0.125rem] font-[inherit] text-[0.875em] text-inherit hover:border-primary hover:text-primary focus-visible:border-primary focus-visible:text-primary aria-pressed:border-primary aria-pressed:text-primary';

/** An arrow pointing the way the order runs: up for ascending. */
function DirectionArrow({ direction }: { direction: SortDirection }) {
  return (
    <svg
      aria-hidden="true"
      data-slot="sort-direction"
      viewBox="0 0 12 12"
      width="12"
      height="12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={direction === 'desc' ? 'rotate-180' : undefined}
    >
      <path d="M6 10V2M2.5 5.5 6 2l3.5 3.5" />
    </svg>
  );
}

/**
 * The fields a list may be ordered by, one chosen at a time. Choosing the
 * chosen field again turns its direction around; choosing another starts it
 * in that field's own first direction.
 */
export function SortControl({
  label,
  fields,
  value,
  directionLabels,
  onChange,
}: {
  label: string;
  fields: readonly {
    readonly key: string;
    readonly name: string;
    /** The direction a field starts in: newest first for a date, say. */
    readonly initial?: SortDirection;
  }[];
  value: SortChoice | undefined;
  /** What each direction is called, for the chosen field's accessible name. */
  directionLabels: Readonly<Record<SortDirection, string>>;
  onChange: (choice: SortChoice) => void;
}) {
  return (
    <FilterRow role="group" aria-label={label} label={label}>
      {fields.map(field => {
        const chosen = value?.field === field.key;
        return (
          <button
            key={field.key}
            type="button"
            data-slot="sort-chip"
            className={CHIP}
            aria-pressed={chosen}
            aria-label={
              chosen
                ? `${field.name}, ${directionLabels[value.direction]}`
                : undefined
            }
            onClick={() =>
              onChange({
                field: field.key,
                direction: chosen
                  ? value.direction === 'asc'
                    ? 'desc'
                    : 'asc'
                  : (field.initial ?? 'asc'),
              })
            }
          >
            {field.name}
            {chosen && <DirectionArrow direction={value.direction} />}
          </button>
        );
      })}
    </FilterRow>
  );
}
