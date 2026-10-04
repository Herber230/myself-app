'use client';

import { type ReactNode, useId } from 'react';

import { FilterRow } from '../filter-row/filter-row.js';

/** A chip, and pressed: filled with the primary colour. */
const CHIP =
  'focus-ring inline-flex cursor-pointer items-center gap-3xs rounded-full border border-border bg-transparent px-xs py-[0.125rem] font-[inherit] text-[0.875em] text-inherit transition-[background-color,border-color,color] duration-(--duration-fast,150ms) hover:border-primary hover:text-primary focus-visible:border-primary focus-visible:text-primary aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-surface';

/** What the option means, over its chip while hovered or focused. */
const TOOLTIP =
  'pointer-events-none invisible absolute bottom-[calc(100%+0.375rem)] left-0 z-20 w-max max-w-[16rem] rounded-md border border-border bg-surface-elevated px-2xs py-3xs text-step-xs leading-snug text-content opacity-0 shadow-[var(--shadow-overlay)] transition-[opacity,visibility] duration-(--duration-fast,150ms) group-focus-within/chip:visible group-focus-within/chip:opacity-100 group-hover/chip:visible group-hover/chip:opacity-100 motion-reduce:transition-none';

export interface ToggleOption {
  readonly key: string;
  readonly name: string;
  /** A CSS colour, drawn as a dot before the name: the chip's key elsewhere. */
  readonly swatch?: string;
  /** What the option means: a tooltip, and the chip's description. */
  readonly description?: string;
}

/** Chips that toggle a value of a filter, each reporting the one toggled. */
export function ToggleGroup({
  label,
  options,
  selected,
  onToggle,
  note,
}: {
  label: string;
  options: readonly ToggleOption[];
  selected: readonly string[];
  onToggle: (key: string) => void;
  /** A line under the chips: what the pressed ones mean, say. */
  note?: ReactNode;
}) {
  const id = useId();
  return (
    <FilterRow role="group" aria-label={label} label={label}>
      {options.map(option => {
        const pressed = selected.includes(option.key);
        const describedBy =
          option.description === undefined ? undefined : `${id}-${option.key}`;
        return (
          <span key={option.key} className="group/chip relative inline-flex">
            <button
              type="button"
              data-slot="filter-chip"
              className={CHIP}
              aria-pressed={pressed}
              aria-describedby={describedBy}
              onClick={() => onToggle(option.key)}
            >
              {pressed && (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 16 16"
                  data-slot="filter-chip-check"
                  className="-ml-[0.125rem] size-[0.75rem] flex-none fill-none stroke-current stroke-2 [stroke-linecap:round] [stroke-linejoin:round]"
                >
                  <path d="m3.5 8.5 3 3 6-7" />
                </svg>
              )}
              {option.swatch !== undefined && !pressed && (
                <span
                  aria-hidden="true"
                  data-slot="filter-chip-swatch"
                  className="size-[0.5rem] flex-none rounded-full"
                  style={{ background: option.swatch }}
                />
              )}
              {option.name}
            </button>
            {describedBy !== undefined && (
              <span
                id={describedBy}
                role="tooltip"
                data-slot="filter-chip-tooltip"
                className={TOOLTIP}
              >
                {option.description}
              </span>
            )}
          </span>
        );
      })}
      {note !== undefined && (
        <div
          data-slot="filter-note"
          className="basis-full text-step-xs text-content-muted"
        >
          {note}
        </div>
      )}
    </FilterRow>
  );
}
