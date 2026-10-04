/**
 * The blog's frame (ADR 0017): a sidebar on the left, with the filter and the
 * way around, and the page's own column beside it — the timeline on the blog's
 * home, the article on a post. On a narrow screen the sidebar sits above.
 *
 * The sidebar folds away: a `<details>`, open on the blog's home and closed on
 * a post, so the article has the room. The browser keeps it, with no script;
 * the stylesheet narrows the sidebar's column while it is closed.
 *
 * No hook and no server-only import: the blog's home renders it from its
 * client filter, a post from the server.
 */
import type { ReactNode } from 'react';

export interface BlogSidebarCopy {
  /** What the sidebar is called to assistive technology. */
  readonly label: string;
  /** The toggle's name while the sidebar is closed. */
  readonly show: string;
  /** The toggle's name while it is open. */
  readonly hide: string;
}

export function BlogLayout({
  header,
  sidebar,
  sidebarOpen,
  copy,
  children,
}: {
  /** The page's title, over its own column: on a narrow screen, above the
   *  sidebar too, so the page opens on what it is. */
  header?: ReactNode;
  sidebar: ReactNode;
  /** Whether the sidebar starts open. */
  sidebarOpen: boolean;
  copy: BlogSidebarCopy;
  children: ReactNode;
}) {
  return (
    <div className="blog-layout">
      {header !== undefined && (
        <div className="blog-layout-header">{header}</div>
      )}
      <aside className="blog-sidebar" aria-label={copy.label}>
        <details
          className="blog-sidebar-panel"
          open={sidebarOpen}
          // A post folds it before hydration on a phone (`FoldScript`).
          suppressHydrationWarning
        >
          <summary className="blog-sidebar-toggle">
            <svg
              className="blog-sidebar-icon"
              viewBox="0 0 16 16"
              width="1em"
              height="1em"
              aria-hidden="true"
              focusable="false"
            >
              <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" />
              <path d="M6 2.5v11" />
            </svg>
            <span className="blog-sidebar-when-open">{copy.hide}</span>
            <span className="blog-sidebar-when-closed">{copy.show}</span>
          </summary>
          <div className="blog-sidebar-body">{sidebar}</div>
        </details>
      </aside>
      <main className="blog-main">{children}</main>
    </div>
  );
}
