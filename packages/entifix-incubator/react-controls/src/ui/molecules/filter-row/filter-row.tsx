import { cn } from '@entifix/react-controls/primitives';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

/**
 * A row: label, then options. On its own it is a sidebar layout — the options
 * share the label's line while they keep 18rem, and drop under it when they
 * cannot, whatever the screen. Inside a `FilterFieldset` it is a subgrid of
 * the fieldset's columns instead, so every row's options start where the
 * longest label ends.
 */
export const FILTER_ROW =
  'flex flex-wrap items-center gap-x-m gap-y-3xs [[data-slot=filter-rows]_&]:col-span-full [[data-slot=filter-rows]_&]:grid [[data-slot=filter-rows]_&]:grid-cols-subgrid';

/** The label's part of the sidebar layout: it grows little, up to 10rem. */
export const FILTER_ROW_LABEL = 'max-w-[10rem] grow basis-[6rem]';

/** The options' part: they take the rest, and wrap below under 18rem. */
export const FILTER_ROW_OPTIONS = 'min-w-[min(100%,18rem)] grow-[999] basis-0';

/**
 * One row of a filter: an optional label in its own column, then whatever it
 * filters by, wrapping under itself as the width runs out. Where the row is
 * narrow, the label heads its own line.
 *
 * Its parts carry `data-slot` (`filter-row`, `filter-label`,
 * `filter-options`), so a page can restyle them without knowing the classes
 * underneath.
 */
export function FilterRow({
  label,
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<'div'> & {
  /** Shown before the row's controls; the row's name comes from elsewhere. */
  label?: ReactNode;
}) {
  return (
    <div
      data-slot="filter-row"
      className={cn(FILTER_ROW, className)}
      {...props}
    >
      {label !== undefined && <FilterLabel aria-hidden>{label}</FilterLabel>}
      <div
        data-slot="filter-options"
        className={cn(
          'flex min-w-0 flex-wrap items-center gap-xs',
          label === undefined ? 'col-span-full basis-full' : FILTER_ROW_OPTIONS,
        )}
      >
        {children}
      </div>
    </div>
  );
}

/** A filter row's label: muted, in the row's first column. */
export function FilterLabel({
  className,
  ...props
}: ComponentPropsWithoutRef<'span'>) {
  return (
    <span
      data-slot="filter-label"
      className={cn(
        FILTER_ROW_LABEL,
        'self-start pt-[0.2rem] text-content-muted',
        className,
      )}
      {...props}
    />
  );
}
