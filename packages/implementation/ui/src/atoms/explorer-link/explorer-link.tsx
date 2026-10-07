'use client';

import type { ReactNode } from 'react';

/** What `useUrlState` listens for after a write (`url-state.ts`). */
// PROTOTYPE: export it from the incubator rather than repeat it.
const SEARCH_CHANGED = 'entifix-url-search-changed';

/**
 * A link that asks the explorer below for something — a status, a record —
 * by writing the query string the explorer reads, then scrolls to it. No
 * page load: the explorer answers in place. Without scripting it is a plain
 * link, and the page loads with the query.
 */
export function ExplorerLink({
  search,
  anchor,
  className,
  children,
}: {
  /** `?status=accepted`. */
  search: string;
  /** The explorer's anchor: `decisions`. */
  anchor: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={`${search}#${anchor}`}
      className={className}
      onClick={event => {
        event.preventDefault();
        const url = new URL(window.location.href);
        url.search = search;
        url.hash = anchor;
        window.history.replaceState(window.history.state, '', url);
        window.dispatchEvent(new Event(SEARCH_CHANGED));
        document
          .getElementById(anchor)
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }}
    >
      {children}
    </a>
  );
}
