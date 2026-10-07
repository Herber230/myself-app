import { ExternalLink } from '@myself-app/entifix-incubator-react-controls';
import type { CSSProperties } from 'react';

import { buildTree, type TreeNode, type TreeRow } from './tree.js';

function Branch({
  node,
  depth,
  baseUrl,
}: {
  node: TreeNode;
  depth: number;
  baseUrl?: string;
}) {
  const name = <code className="file-tree-name">{node.name}</code>;
  const row = (
    <>
      {baseUrl ? (
        <ExternalLink
          href={`${baseUrl}${node.path}`}
          className="file-tree-link"
        >
          {name}
        </ExternalLink>
      ) : (
        name
      )}
      {node.note && <span className="file-tree-note">{node.note}</span>}
    </>
  );
  return (
    <li
      className="file-tree-item"
      // How deep it sits: the notes line up in one column whatever the depth.
      style={{ '--depth': depth } as CSSProperties}
    >
      {node.children.length === 0 ? (
        <div className="file-tree-row">{row}</div>
      ) : (
        <details open className="file-tree-folder">
          <summary className="file-tree-row">{row}</summary>
          <ul className="file-tree-list">
            {node.children.map(child => (
              <Branch
                key={child.path}
                node={child}
                depth={depth + 1}
                baseUrl={baseUrl}
              />
            ))}
          </ul>
        </details>
      )}
    </li>
  );
}

/**
 * A project's file structure (#77): its annotated paths as a tree, each folder
 * that holds others folding open and shut with no script (`<details>`), each
 * name a link into the repository when `baseUrl` is given.
 */
export function FileTree({
  rows,
  label,
  baseUrl,
}: {
  rows: readonly TreeRow[];
  /** Names the tree: "File structure". */
  label: string;
  /**
   * Where a path is browsed, its path appended:
   * `https://github.com/owner/repo/tree/main/`. Without it, names are text.
   */
  baseUrl?: string;
}) {
  return (
    <div className="file-tree">
      <ul className="file-tree-list" aria-label={label}>
        {buildTree(rows).map(node => (
          <Branch key={node.path} node={node} depth={0} baseUrl={baseUrl} />
        ))}
      </ul>
    </div>
  );
}
