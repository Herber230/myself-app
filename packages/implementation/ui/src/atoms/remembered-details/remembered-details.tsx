'use client';

import { type ReactNode, useEffect, useRef } from 'react';

/** What a disclosure leaves in storage, once a reader has toggled it. */
const OPEN = 'open';
const CLOSED = 'closed';

/**
 * A disclosure that starts open, or closed (`defaultOpen`), and stays the way
 * a reader last left it, on this browser (`localStorage`, under
 * `storageKey`). The static HTML is as `defaultOpen` says, which is also what
 * a reader without scripting, or without storage, gets.
 */
export function RememberedDetails({
  storageKey,
  summary,
  defaultOpen = true,
  className,
  children,
}: {
  storageKey: string;
  summary: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDetailsElement>(null);
  // A browser fires `toggle` for a disclosure parsed open, which may arrive
  // before the stored state is read: no toggle counts until it has been.
  const restored = useRef(false);

  useEffect(() => {
    restored.current = true;
    const details = ref.current as HTMLDetailsElement;
    try {
      const stored = localStorage.getItem(storageKey);
      // Toggled before the page was ready: remember that instead.
      if (details.open !== defaultOpen)
        localStorage.setItem(storageKey, details.open ? OPEN : CLOSED);
      else if (stored === OPEN || stored === CLOSED)
        details.open = stored === OPEN;
    } catch {
      // Storage refused (a private window, blocked site data): as the HTML is.
    }
  }, [storageKey, defaultOpen]);

  const remember = () => {
    if (!restored.current) return;
    try {
      localStorage.setItem(storageKey, ref.current?.open ? OPEN : CLOSED);
    } catch {
      // Nothing to remember it in.
    }
  };

  return (
    <details
      ref={ref}
      open={defaultOpen}
      className={className}
      onToggle={remember}
    >
      <summary>{summary}</summary>
      {children}
    </details>
  );
}
