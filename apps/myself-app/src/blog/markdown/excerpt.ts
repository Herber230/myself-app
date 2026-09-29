/**
 * The opening of a post as plain text (ADR 0017): what its card on the blog's
 * timeline shows under the summary, fading out. Read at build, so no Markdown
 * parser reaches the browser.
 *
 * Only the prose a reader starts with counts: the lead and the paragraphs,
 * never a heading, a callout, a figure, a list or code.
 */
import type { Root, RootContent } from 'mdast';
import remarkDirective from 'remark-directive';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { unified } from 'unified';

/** About four lines of a card: enough to fade, never a whole post. */
const EXCERPT_LENGTH = 320;

/** A node's text, as a reader would see it. */
function textOf(node: RootContent): string {
  if ('value' in node && node.type !== 'html') return node.value;
  if ('children' in node) return node.children.map(textOf).join('');
  return '';
}

/** The prose a post opens with, in reading order. */
function openingProse(tree: Root): string[] {
  return tree.children.flatMap(node => {
    if (node.type === 'paragraph') return [textOf(node)];
    if (node.type === 'containerDirective' && node.name === 'lead') {
      return node.children.map(textOf);
    }
    return [];
  });
}

export function excerptOf(
  markdown: string,
  length: number = EXCERPT_LENGTH,
): string {
  const tree = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkDirective)
    .parse(markdown);
  const text = openingProse(tree)
    .map(paragraph => paragraph.replace(/\s+/g, ' ').trim())
    .filter(paragraph => paragraph !== '')
    .join(' ');
  if (text.length <= length) return text;
  // Cut at the last whole word; the card's fade stands for the rest.
  const cut = text.slice(0, length + 1);
  const space = cut.lastIndexOf(' ');
  return (space > 0 ? cut.slice(0, space) : text.slice(0, length)).trimEnd();
}
