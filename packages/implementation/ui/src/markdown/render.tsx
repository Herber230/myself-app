/**
 * A post's Markdown as React elements, rendered once during `next build`
 * (ADR 0017). Nothing of it reaches the browser: no Markdown parser, no
 * highlighter, and no HTML string set by hand.
 *
 * The body is sanitized before anything the build adds — heading anchors and
 * highlighted code — so a body can only ever hold what the allowlist admits,
 * wherever it came from.
 */
import rehypeShiki from '@shikijs/rehype';
import type { Root as Hast } from 'hast';
import { toJsxRuntime } from 'hast-util-to-jsx-runtime';
import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';
import rehypeSanitize, {
  defaultSchema,
  type Options as Schema,
} from 'rehype-sanitize';
import rehypeSlug from 'rehype-slug';
import remarkDirective from 'remark-directive';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

import { remarkPostDirectives } from './directives.js';
import { remarkPostResources, type ResourceContext } from './resources.js';

type Attributes = NonNullable<Schema['attributes']>[string];

/** GitHub's allowlist, which `rehype-sanitize` ships complete. */
const BASE = defaultSchema as Schema & {
  tagNames: string[];
  attributes: Record<string, Attributes>;
};

/** The default allowlist, and what the site's own markup needs on top: the
 * renderer's, and the outline's (`outline.ts`), so their ids agree. */
export const SCHEMA: Schema = {
  ...BASE,
  tagNames: [...BASE.tagNames, 'aside', 'figure', 'figcaption'],
  attributes: {
    ...BASE.attributes,
    aside: ['className', 'role'],
    div: [...(BASE.attributes.div as Attributes), 'className'],
    figure: ['className'],
    img: [
      ...(BASE.attributes.img as Attributes),
      'width',
      'height',
      'loading',
      'decoding',
    ],
    a: [...(BASE.attributes.a as Attributes), 'rel'],
  },
};

/** A link within the site goes through Next's `Link`; any other is an anchor. */
function PostLink({ href = '', ...props }: ComponentProps<'a'>) {
  return href.startsWith('/') ? (
    <Link href={href} {...props} />
  ) : (
    <a href={href} {...props} />
  );
}

export async function renderMarkdown(
  markdown: string,
  context: ResourceContext,
): Promise<ReactNode> {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkDirective)
    .use(remarkPostDirectives, { source: context.source })
    .use(remarkPostResources, context)
    .use(remarkRehype)
    .use(rehypeSanitize, SCHEMA)
    .use(rehypeSlug)
    .use(rehypeShiki, {
      themes: { light: 'github-light', dark: 'github-dark' },
      // Every theme's colours are CSS variables; `post-body.css` picks.
      defaultColor: false,
    });
  const tree = (await processor.run(processor.parse(markdown))) as Hast;
  return toJsxRuntime(tree, {
    Fragment,
    jsx,
    jsxs,
    components: { a: PostLink },
  });
}
