import Link from 'next/link';

export interface LineageLink {
  readonly id: string;
  /** "ADR 0011 · A moving hero". */
  readonly label: string;
  readonly href: string;
}

/**
 * What a decision record replaces and what replaces it (#77): the history a
 * record is part of, since a decision that no longer holds is superseded by
 * a new record rather than edited away. Nothing when it has neither.
 */
export function DecisionLineage({
  supersedes,
  supersededBy,
  labels,
}: {
  supersedes: readonly LineageLink[];
  supersededBy: readonly LineageLink[];
  labels: { readonly supersedes: string; readonly supersededBy: string };
}) {
  const groups = [
    { key: 'supersedes', label: labels.supersedes, links: supersedes },
    { key: 'superseded-by', label: labels.supersededBy, links: supersededBy },
  ].filter(group => group.links.length > 0);
  if (groups.length === 0) return null;
  return (
    <dl className="adr-lineage">
      {groups.map(group => (
        <div key={group.key} className="adr-lineage-group">
          <dt>{group.label}</dt>
          {group.links.map(link => (
            <dd key={link.id}>
              <Link href={link.href}>{link.label}</Link>
            </dd>
          ))}
        </div>
      ))}
    </dl>
  );
}
