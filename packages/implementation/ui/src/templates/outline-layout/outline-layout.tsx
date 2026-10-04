import { cn } from '@entifix/react-controls/primitives';
import type { ReactNode } from 'react';

import {
  type OutlineEntry,
  PageOutline,
} from '../../molecules/page-outline/page-outline.js';

/**
 * A page beside its table of contents: the outline in a column of its own,
 * held in view, where the screen has room for one (64rem); above that, a
 * strip of links held under the top edge, scrolling sideways. A page with
 * fewer than two headings has nothing to jump between, and no outline.
 */
export function OutlineLayout({
  entries,
  label,
  id = 'page-outline-label',
  className,
  children,
}: {
  entries: readonly OutlineEntry[];
  /** "On this page". */
  label: string;
  /** The outline's heading id, unique on the page. */
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  const outlined = entries.length >= 2;
  return (
    <div
      className={cn('outline-layout', className)}
      data-outlined={outlined ? '' : undefined}
    >
      {outlined && (
        <aside className="outline-layout-aside">
          <PageOutline entries={entries} label={label} id={id} />
        </aside>
      )}
      <div className="outline-layout-main">{children}</div>
    </div>
  );
}
