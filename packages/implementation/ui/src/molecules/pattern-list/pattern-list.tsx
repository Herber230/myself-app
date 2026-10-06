import { ExplorerLink } from '../../atoms/explorer-link/explorer-link.js';

export interface PatternItem {
  readonly id: string;
  readonly name: string;
  readonly summary: string;
  /** The records that decided it: `{ number: '0001', label: 'ADR 0001' }`. */
  readonly decisions?: readonly { number: string; label: string }[];
}

/**
 * A project's patterns (#77): a grid of numbered cards, a name and a
 * sentence each, and a link to each record that decided it, which opens that
 * record in the explorer below (`anchor`).
 */
export function PatternList({
  patterns,
  anchor,
}: {
  patterns: readonly PatternItem[];
  /** The explorer's anchor: `decisions`. */
  anchor: string;
}) {
  return (
    <ol className="pattern-list">
      {patterns.map((pattern, index) => (
        <li key={pattern.id} className="pattern-card">
          <span className="pattern-card-number" aria-hidden="true">
            {String(index + 1).padStart(2, '0')}
          </span>
          <h3 className="pattern-card-name">{pattern.name}</h3>
          <p className="pattern-card-summary">{pattern.summary}</p>
          {pattern.decisions && pattern.decisions.length > 0 && (
            <p className="pattern-card-decisions">
              {pattern.decisions.map(decision => (
                <ExplorerLink
                  key={decision.number}
                  className="pattern-card-decision"
                  search={`?adr=${decision.number}`}
                  anchor={anchor}
                >
                  {decision.label}
                </ExplorerLink>
              ))}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}
