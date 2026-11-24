import { button, cn, NavMenu } from '@entifix/react-controls/primitives';
import type { ReactNode } from 'react';

/** The ▾ segment: the primary button's look, joined to the action before it. */
const TRIGGER = cn(
  button({ variant: 'primary', size: 'sm' }),
  'h-auto cursor-pointer list-none self-stretch rounded-l-none border-l border-l-[color-mix(in_srgb,var(--color-primary-content)_25%,transparent)] px-2xs select-none [&_[data-slot=nav-menu-chevron]]:text-current [&::-webkit-details-marker]:hidden',
);

/**
 * One main action, and a menu of the related ones beside it: `[Download │ ▾]`.
 *
 * entifix shipped this until 0.20, and deleted it for having no adopter
 * (entifix ADR 0026); this site is one, so it lives here until it goes back.
 * It is kept on `NavMenu`, a native `<details>`, rather than entifix's
 * scripted `Menu`: a page that otherwise ships no menu library pays nothing
 * for it, and it opens with scripting off.
 *
 * The caller renders the main action — a link or a button, styled as the
 * primary button — so it stays in the static HTML and keeps its own
 * attributes; without `children` it stands alone, as before scripting runs.
 * The page's own menu handling closes it. Parts carry `data-slot`
 * (`split-button`, and the menu's own).
 */
export function SplitButton({
  primary,
  menuLabel,
  children,
  className,
}: {
  /** The main action, its corners squared on the side the menu joins. */
  primary: ReactNode;
  /** The accessible name of the ▾ trigger. */
  menuLabel: string;
  /** The menu's entries; none, and the main action stands alone. */
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      data-slot="split-button"
      className={cn(
        'inline-flex items-stretch',
        children !== undefined && '[&>:first-child]:rounded-r-none',
        className,
      )}
    >
      {primary}
      {children !== undefined && (
        <NavMenu
          label={menuLabel}
          icon={null}
          className="flex"
          triggerClassName={TRIGGER}
        >
          {children}
        </NavMenu>
      )}
    </div>
  );
}
