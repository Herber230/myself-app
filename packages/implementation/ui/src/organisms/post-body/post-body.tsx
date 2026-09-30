/**
 * A post's body, rendered from its Markdown during `next build` (ADR 0017).
 * The callouts' names come from the catalogs, as CSS variables their
 * stylesheet reads, so a Spanish post says "Nota" above a note.
 *
 * Functions the page awaits, not async components: the page's element tree
 * stays synchronous below the page itself.
 */
import type { CSSProperties, ReactNode } from 'react';

import { siteT } from '../../i18n/server.js';
import { renderMarkdown } from '../../markdown/render.js';
import type { SiteLocale } from '../../routing/site-locales.js';

export interface MarkdownBodyInput {
  id: string;
  markdown: string;
  locale: SiteLocale;
  /** Every page a post may link to, locale-free. */
  sitePaths: readonly string[];
  /** The app's `public/` folder, where a post's images are (#75). */
  publicDirectory: string;
}

/**
 * Any Markdown the content holds beside its records — a project's overview,
 * a decision record's body (#77) — rendered as a post's is, held to the same
 * checks, and named by `source` in a problem's message.
 */
export function renderMarkdownBody({
  source,
  ...input
}: MarkdownBodyInput & { source: string }): Promise<ReactNode> {
  return renderBody(source, input);
}

export function renderPostBody(input: MarkdownBodyInput): Promise<ReactNode> {
  return renderBody(`posts/${input.id}.${input.locale}.md`, input);
}

async function renderBody(
  source: string,
  { id, markdown, locale, sitePaths, publicDirectory }: MarkdownBodyInput,
): Promise<ReactNode> {
  const t = siteT(locale);
  const content = await renderMarkdown(markdown, {
    source,
    post: id,
    locale,
    sitePaths: new Set(sitePaths),
    publicDirectory,
  });
  const labels = {
    '--post-note-label': JSON.stringify(t('blogPage.callout.note')),
    '--post-tip-label': JSON.stringify(t('blogPage.callout.tip')),
    '--post-warning-label': JSON.stringify(t('blogPage.callout.warning')),
  } as CSSProperties;
  return (
    <div className="post-body" style={labels}>
      {content}
    </div>
  );
}
