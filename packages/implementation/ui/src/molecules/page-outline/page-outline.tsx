/**
 * A page's table of contents: its sections, and their subsections indented,
 * each a link to its heading, the one being read marked as the reader scrolls
 * (`ActiveHeading`). A post reads it from its Markdown at build (`outlineOf`),
 * a project's page from its own parts, so every link works with no script.
 *
 * A column of links where it has room; where its container lays the list out
 * in a row (`OutlineLayout` on a phone), the marked one is kept in view.
 */
import { ActiveHeading } from '@myself-app/entifix-incubator-react-controls';

/** One heading of the page. */
export interface OutlineEntry {
  /** The heading's anchor in the page. */
  readonly id: string;
  readonly text: string;
  /** A section (`2`) or a subsection (`3`). */
  readonly depth: 2 | 3;
}

export function PageOutline({
  entries,
  label,
  id,
}: {
  entries: readonly OutlineEntry[];
  /** The list's heading and the `<nav>`'s name: "On this page". */
  label: string;
  /** The heading's id, unique on the page. */
  id: string;
}) {
  return (
    <nav className="page-outline" aria-labelledby={id}>
      <h2 id={id} className="page-outline-label">
        {label}
      </h2>
      <ol className="page-outline-list">
        {entries.map(entry => (
          <li key={entry.id} data-depth={entry.depth}>
            <a href={`#${entry.id}`} data-section={entry.id}>
              {entry.text}
            </a>
          </li>
        ))}
      </ol>
      <ActiveHeading ids={entries.map(entry => entry.id)} />
    </nav>
  );
}
