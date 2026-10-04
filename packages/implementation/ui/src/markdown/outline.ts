/**
 * A post's outline: its sections and subsections, read from the Markdown
 * during `next build` for the post's table of contents.
 *
 * It runs the renderer's own steps up to the heading anchors (`render.tsx`) —
 * the same parse, the same directives, the same allowlist, the same slugs —
 * so every entry's `id` is the anchor the rendered body carries.
 */
import type { Element, ElementContent, Root as Hast, Text } from 'hast';
import rehypeSanitize from 'rehype-sanitize';
import rehypeSlug from 'rehype-slug';
import remarkDirective from 'remark-directive';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

import type { OutlineEntry } from '../molecules/page-outline/page-outline.js';
import { remarkPostDirectives } from './directives.js';
import { SCHEMA } from './render.js';

export type { OutlineEntry };

const DEPTHS: Readonly<Record<string, 2 | 3>> = { h2: 2, h3: 3 };

export async function outlineOf(
  markdown: string,
  source: string,
): Promise<readonly OutlineEntry[]> {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkDirective)
    .use(remarkPostDirectives, { source })
    .use(remarkRehype)
    .use(rehypeSanitize, SCHEMA)
    .use(rehypeSlug);
  const tree = (await processor.run(processor.parse(markdown))) as Hast;
  const entries: OutlineEntry[] = [];
  visit(tree.children, entries);
  return entries;
}

/** Every h2 and h3, in document order, wherever a directive nests them. */
function visit(
  nodes: readonly (Hast['children'][number] | ElementContent)[],
  into: OutlineEntry[],
) {
  for (const node of nodes) {
    if (node.type !== 'element') continue;
    const depth = DEPTHS[node.tagName];
    const id = node.properties.id;
    if (depth !== undefined && typeof id === 'string')
      into.push({ id, text: textOf(node), depth });
    else visit(node.children, into);
  }
}

/**
 * A heading's words. Past the allowlist a heading holds only text and
 * elements: Markdown's HTML, comments included, never reaches it.
 */
function textOf(node: Element | Text): string {
  return node.type === 'text'
    ? node.value
    : (node.children as (Element | Text)[]).map(textOf).join('');
}
