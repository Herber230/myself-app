export interface PatternItem {
  readonly id: string;
  readonly name: string;
  readonly summary: string;
}

/** A project's patterns (#77): a grid of cards, a name and a sentence each. */
export function PatternList({
  patterns,
}: {
  patterns: readonly PatternItem[];
}) {
  return (
    <ul className="pattern-list">
      {patterns.map(pattern => (
        <li key={pattern.id} className="pattern-card">
          <h3 className="pattern-card-name">{pattern.name}</h3>
          <p className="pattern-card-summary">{pattern.summary}</p>
        </li>
      ))}
    </ul>
  );
}
