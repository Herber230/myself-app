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

  useEffect(() => {
    try {
      if (localStorage.getItem(storageKey) === CLOSED && ref.current) {
        ref.current.open = false;
      }
    } catch {
      // Storage refused (a private window, blocked site data): stay open.
    }
  }, [storageKey]);

  const remember = () => {
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
