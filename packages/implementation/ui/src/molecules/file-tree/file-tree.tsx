import { buildTree, type TreeNode, type TreeRow } from './tree.js';

function Branch({ node }: { node: TreeNode }) {
  const row = (
    <>
      <code className="file-tree-name">{node.name}</code>
      {node.note && <span className="file-tree-note">{node.note}</span>}
    </>
  );
  return (
    <li className="file-tree-item">
      {node.children.length === 0 ? (
        <div className="file-tree-row">{row}</div>
      ) : (
        <details open className="file-tree-folder">
          <summary className="file-tree-row">{row}</summary>
          <ul className="file-tree-list">
            {node.children.map(child => (
              <Branch key={child.path} node={child} />
            ))}
          </ul>
        </details>
      )}
    </li>
  );
}

/**
 * A project's file structure (#77): its annotated paths as a tree, each folder
 * that holds others folding open and shut with no script (`<details>`).
 */
export function FileTree({
  rows,
  label,
}: {
  rows: readonly TreeRow[];
  /** Names the tree: "File structure". */
  label: string;
}) {
  return (
    <ul className="file-tree file-tree-list" aria-label={label}>
      {buildTree(rows).map(node => (
        <Branch key={node.path} node={node} />
      ))}
    </ul>
  );
}
