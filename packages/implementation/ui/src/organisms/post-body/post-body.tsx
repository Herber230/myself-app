/**
 * A post's body, rendered from its Markdown during `next build` (ADR 0017).
 * The callouts' names come from the catalogs, as CSS variables their
 * stylesheet reads, so a Spanish post says "Nota" above a note.
 *
 * A function the page awaits, not an async component: the page's element tree
 * stays synchronous below the page itself.
 */
import type { CSSProperties, ReactNode } from 'react';

import { siteT } from '../../i18n/server.js';
import { renderMarkdown } from '../../markdown/render.js';
import type { SiteLocale } from '../../routing/site-locales.js';

export async function renderPostBody({
  id,
  markdown,
  locale,
  sitePaths,
  publicDirectory,
}: {
  id: string;
  markdown: string;
  locale: SiteLocale;
  /** Every page a post may link to, locale-free. */
  sitePaths: readonly string[];
  /** The app's `public/` folder, where a post's images are (#75). */
  publicDirectory: string;
}): Promise<ReactNode> {
  const t = siteT(locale);
  const content = await renderMarkdown(markdown, {
    source: `posts/${id}.${locale}.md`,
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
