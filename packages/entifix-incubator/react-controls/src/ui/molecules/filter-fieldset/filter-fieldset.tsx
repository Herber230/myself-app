import { Stack } from '@entifix/react-controls/primitives';
import type { ReactNode } from 'react';

/**
 * The controls of a filter kept in the URL (#41, #70), grouped and named. They
 * hold no state: each reports what it would change, and the page writes it to
 * the URL.
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
      className="m-0 min-w-0 border-0 p-0 text-[0.875rem]"
    >
      <legend className="sr-only">{label}</legend>
      <Stack gap="s">{children}</Stack>
    </fieldset>
  );
}
