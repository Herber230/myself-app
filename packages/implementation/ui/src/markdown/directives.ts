/**
 * The paragraph types a post may use (ADR 0017), as Markdown directives:
 *
 *   :::note / :::tip / :::warning   a callout
 *   :::lead                         the opening paragraph, set larger
 *   :::aside                        a digression the reader may skip
 *   ::figure[caption]{src alt}      an image with its caption
 *
 * Each becomes an element with a class `post-body.css` styles. Any other
 * directive stops the build: a typo is caught where it was made, not found
 * later as text on the page.
 */
import type { Paragraph, PhrasingContent, Root } from 'mdast';
import type { ContainerDirective, LeafDirective } from 'mdast-util-directive';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

import { PostContentError } from './problem.js';

export const CALLOUTS = ['note', 'tip', 'warning'] as const;

type Directive = ContainerDirective | LeafDirective;

function asElement(
  node: Directive,
  tagName: string,
  className: string,
  properties: Record<string, string> = {},
) {
  node.data = {
    hName: tagName,
    hProperties: { className: className.split(' '), ...properties },
  };
}

/** `::figure[caption]{src alt}`: the image, then its caption. */
function asFigure(node: LeafDirective, source: string) {
  // remark-directive always parses a `{…}` into an object, empty or not.
  const { src, alt } = node.attributes as Record<string, string | undefined>;
  if (!src) throw new PostContentError(source, node, 'a figure needs a src');
  const caption: Paragraph = {
    type: 'paragraph',
    data: { hName: 'figcaption' },
    children: node.children as PhrasingContent[],
  };
  asElement(node, 'figure', 'post-figure');
  node.children = [
    { type: 'image', url: src, alt },
    ...(caption.children.length > 0
      ? [caption as unknown as PhrasingContent]
      : []),
  ];
}

export const remarkPostDirectives: Plugin<[{ source: string }], Root> =
  ({ source }) =>
  tree => {
    visit(tree, node => {
      if (
        node.type !== 'containerDirective' &&
        node.type !== 'leafDirective' &&
        node.type !== 'textDirective'
      ) {
        return;
      }
      const { name } = node;
      if (node.type === 'containerDirective') {
        if ((CALLOUTS as readonly string[]).includes(name)) {
          asElement(node, 'aside', `post-callout post-callout-${name}`, {
            role: 'note',
          });
          return;
        }
        if (name === 'lead') return asElement(node, 'div', 'post-lead');
        if (name === 'aside') return asElement(node, 'aside', 'post-aside');
      }
      if (node.type === 'leafDirective' && name === 'figure') {
        return asFigure(node, source);
      }
      throw new PostContentError(
        source,
        node,
        `holds an unknown directive "${name}"`,
      );
    });
  };
