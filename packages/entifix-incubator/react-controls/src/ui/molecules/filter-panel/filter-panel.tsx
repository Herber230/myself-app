import type { ReactNode } from 'react';

/** A filter value in force, shown while the panel's rows are closed too. */
export interface ActiveFilter {
  readonly key: string;
  /** What the chip says: `Ring: Adopt`. */
  readonly label: string;
  /** The remove button's accessible name: `Remove Ring: Adopt`. */
  readonly removeLabel: string;
  readonly onRemove: () => void;
}

/**
 * A filter drawn as a card: a disclosure holding its rows, under a header
 * that names it and counts what is in force, and a footer that stays visible
 * while the rows are closed: the search, the count and — through
 * `ActiveFilters` — each active value as a chip that removes it.
 *
 * The rows are a native `<details>`, so they open with scripting off; `open`
 * is only where it starts. No hooks. Its parts carry `data-slot`
 * (`filter-panel`, `-summary`, `-icon`, `-title`, `-count`, `-chevron`,
 * `-body`, `-footer`, `-active`, `-active-chip`), so a page can restyle them.
 */
export function FilterPanel({
  title,
  icon,
  activeLabel,
  open,
  footer,
  children,
}: {
  title: string;
  icon?: ReactNode;
  /** The header's count, already filled in; absent while nothing is active. */
  activeLabel?: string;
  /** Whether the rows start open. */
  open?: boolean;
  /** Always visible under the rows: a `FilterSummary`. */
  footer?: ReactNode;
  /** The rows: a `FilterFieldset`. */
  children: ReactNode;
}) {
  return (
    <div
      data-slot="filter-panel"
      className="overflow-hidden rounded-lg border border-border bg-surface-elevated text-step-sm"
    >
      <details
        data-slot="filter-panel-details"
        open={open}
        className="group/panel"
      >
        <summary
          data-slot="filter-panel-summary"
          className="flex cursor-pointer list-none items-center gap-2xs px-s py-xs font-medium text-content select-none [&::-webkit-details-marker]:hidden"
        >
          {icon !== undefined && (
            <span
              data-slot="filter-panel-icon"
              className="inline-flex text-primary"
            >
              {icon}
            </span>
          )}
          <span data-slot="filter-panel-title">{title}</span>
          {activeLabel !== undefined && (
            <span
              data-slot="filter-panel-count"
              className="rounded-full bg-[color-mix(in_srgb,var(--color-primary)_18%,transparent)] px-2xs py-[0.0625rem] text-step-xs text-primary"
            >
              {activeLabel}
            </span>
          )}
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            data-slot="filter-panel-chevron"
            className="ml-auto size-[1rem] flex-none fill-none stroke-current stroke-2 text-content-muted transition-[rotate] duration-(--duration-fast,150ms) [stroke-linecap:round] [stroke-linejoin:round] group-open/panel:rotate-180 motion-reduce:transition-none"
          >
            <path d="m7 10 5 5 5-5" />
          </svg>
        </summary>
        <div
          data-slot="filter-panel-body"
          className="border-t border-border px-s py-s"
        >
          {children}
        </div>
      </details>
      {footer !== undefined && (
        <div
          data-slot="filter-panel-footer"
          className="border-t border-border px-s py-xs"
        >
          {footer}
        </div>
      )}
    </div>
  );
}

/**
 * Each active value as a chip that removes it: placed in a `FilterSummary`, so
 * the chips wrap with its count and its way back.
 */
export function ActiveFilters({ active }: { active: readonly ActiveFilter[] }) {
  return (
    <ul
      data-slot="filter-panel-active"
      className="m-0 flex list-none flex-wrap gap-2xs p-0"
    >
      {active.map(filter => (
        <li key={filter.key}>
          <button
            type="button"
            data-slot="filter-panel-active-chip"
            aria-label={filter.removeLabel}
            className="focus-ring inline-flex cursor-pointer items-center gap-3xs rounded-full border border-[color-mix(in_srgb,var(--color-primary)_45%,var(--color-border))] bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] py-[0.125rem] pr-2xs pl-xs font-[inherit] text-step-xs whitespace-nowrap text-content transition-[border-color,background-color] duration-(--duration-fast,150ms) hover:border-primary hover:bg-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]"
            onClick={filter.onRemove}
          >
            {filter.label}
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              className="size-[0.75rem] flex-none fill-none stroke-current stroke-2 text-content-muted [stroke-linecap:round]"
            >
              <path d="m4 4 8 8m0-8-8 8" />
            </svg>
          </button>
        </li>
      ))}
    </ul>
  );
}
