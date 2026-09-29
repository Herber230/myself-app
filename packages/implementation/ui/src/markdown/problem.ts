import type { Node } from 'mdast';

/**
 * A post the build cannot render, with where: `posts/<id>.<locale>.md:<line>`
 * and what is wrong. Thrown during `next build`, which stops on it.
 */
export class PostContentError extends Error {
  constructor(source: string, node: Node, problem: string) {
    const line = node.position?.start.line;
    super(`${source}${line === undefined ? '' : `:${line}`} ${problem}`);
    this.name = 'PostContentError';
  }
}
