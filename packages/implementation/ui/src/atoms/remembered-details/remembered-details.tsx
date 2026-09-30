'use client';

import { type ReactNode, useEffect, useRef } from 'react';

/** What a closed disclosure leaves in storage. */
const CLOSED = 'closed';

/**
 * A disclosure that starts open and stays closed once a reader closes it, on
 * this browser (`localStorage`, under `storageKey`). The static HTML is open,
 * which is also what a reader without scripting, or without storage, gets.
 */
export function RememberedDetails({
  storageKey,
  summary,
  className,
  children,
}: {
  storageKey: string;
  summary: ReactNode;
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
      // Closed before the page was ready: remember that too.
      if (!details.open) localStorage.setItem(storageKey, CLOSED);
      else if (localStorage.getItem(storageKey) === CLOSED)
        details.open = false;
    } catch {
      // Storage refused (a private window, blocked site data): stay open.
    }
  }, [storageKey]);

  const remember = () => {
    if (!restored.current) return;
    try {
      if (ref.current?.open) localStorage.removeItem(storageKey);
      else localStorage.setItem(storageKey, CLOSED);
    } catch {
      // Nothing to remember it in.
    }
  };

  return (
    <details ref={ref} open className={className} onToggle={remember}>
      <summary>{summary}</summary>
      {children}
    </details>
  );
}
