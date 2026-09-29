import { cn } from '@entifix/react-controls/primitives';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

/**
 * One row of a filter: an optional label, then whatever it filters by, wrapping
 * as the width runs out. On a phone the label heads its own line.
 *
 * Its parts carry `data-slot` (`filter-row`, `filter-label`), so a page can
 * restyle them without knowing the classes underneath.
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
      className={cn('flex flex-wrap items-center gap-xs', className)}
      {...props}
    >
      {label !== undefined && <FilterLabel aria-hidden>{label}</FilterLabel>}
      {children}
    </div>
  );
}

/** A filter row's label: muted, and a line of its own on a phone. */
export function FilterLabel({
  className,
  ...props
}: ComponentPropsWithoutRef<'span'>) {
  return (
    <span
      data-slot="filter-label"
      className={cn(
        'min-w-[6rem] text-content-muted max-[40rem]:basis-full',
        className,
      )}
      {...props}
    />
  );
}
