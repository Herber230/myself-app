import type { ReactNode } from 'react';

/**
 * The controls of a filter kept in the URL (#41, #70), grouped and named. They
 * hold no state: each reports what it would change, and the page writes it to
 * the URL. The rows share one label column while the fieldset is 28rem wide
 * or more — its own width, not the screen's — and stack each label over its
 * options below that.
 */
export function FilterFieldset({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <fieldset
      data-slot="filter-fieldset"
      className="@container/filters m-0 min-w-0 border-0 p-0 text-step-sm"
    >
      <legend className="sr-only">{label}</legend>
      {/* One label column for every row: each row is a subgrid of it. */}
      <div
        data-slot="filter-rows"
        className="grid grid-cols-1 gap-x-m gap-y-s @min-[28rem]/filters:grid-cols-[minmax(6rem,max-content)_minmax(0,1fr)]"
      >
        {children}
      </div>
    </fieldset>
  );
}
