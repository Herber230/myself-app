/**
 * A project's annotated paths as a tree (#77). The rows are written flat —
 * `packages/ts/`, `packages/ts/core/` — and a folder that only leads to others
 * (`packages/`) is added without a note, so every row sits under its parent.
 */

export interface TreeRow {
  readonly path: string;
  readonly note: string;
}

export interface TreeNode {
  /** The last segment, with a folder's `/`: `core/`. */
  readonly name: string;
  readonly path: string;
  readonly note?: string;
  readonly children: TreeNode[];
}

export function buildTree(rows: readonly TreeRow[]): TreeNode[] {
  const roots: TreeNode[] = [];
  const byPath = new Map<string, TreeNode>();
  const nodeAt = (path: string, note?: string): TreeNode => {
    const found = byPath.get(path);
    if (found !== undefined) {
      if (note !== undefined) Object.assign(found, { note });
      return found;
    }
    const segments = path.split('/').filter(Boolean);
    const folder = path.endsWith('/');
    const name = `${segments.at(-1)}${folder ? '/' : ''}`;
    const node: TreeNode = {
      name,
      path,
      ...(note !== undefined && { note }),
      children: [],
    };
    byPath.set(path, node);
    const parent =
      segments.length > 1 ? `${segments.slice(0, -1).join('/')}/` : undefined;
    (parent === undefined ? roots : nodeAt(parent).children).push(node);
    return node;
  };
  for (const row of rows) nodeAt(row.path, row.note);
  return roots;
}
