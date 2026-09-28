/**
 * A post's body, rendered from its Markdown during `next build` (ADR 0017).
 * The callouts' names come from the catalogs, as CSS variables their
 * stylesheet reads, so a Spanish post says "Nota" above a note.
 *
 * A function the page awaits, not an async component: the page's element tree
 * stays synchronous below the page itself.
 */
import { join } from 'node:path';

import type { CSSProperties, ReactNode } from 'react';

import { renderMarkdown } from '../../blog/markdown/render';
import { siteT } from '../../i18n/server';
import type { SiteLocale } from '../../site-locales';

export async function renderPostBody({
  id,
  markdown,
  locale,
  sitePaths,
}: {
  id: string;
  markdown: string;
  locale: SiteLocale;
  /** Every page a post may link to, locale-free. */
  sitePaths: readonly string[];
}): Promise<ReactNode> {
  const t = siteT(locale);
  const content = await renderMarkdown(markdown, {
    source: `posts/${id}.${locale}.md`,
    post: id,
    locale,
    sitePaths: new Set(sitePaths),
    // The build and test targets both run from the app's folder.
    publicDirectory: join(process.cwd(), 'public'),
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
