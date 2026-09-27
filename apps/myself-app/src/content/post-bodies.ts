/**
 * A post's body, read from its Markdown files (ADR 0017).
 *
 * `posts.json` holds what a post is; `posts/<id>.<locale>.md` holds what it
 * says. The content package imports nothing, so it cannot read them: this
 * does, before validation, so a missing locale fails the build with the
 * post's path, and a placeholder in a body is found like any other.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { SITE_LOCALES, type SiteLocale } from '@myself-app/domain';

/** Where the bodies are, from the app's folder, which build and test run in. */
const POSTS_DIRECTORY = join(
  process.cwd(),
  'node_modules',
  '@myself-app',
  'content',
  'src',
  'posts',
);

/** The Markdown of one post in one locale, or `undefined` when there is none. */
export type ReadPostBody = (
  id: string,
  locale: SiteLocale,
) => string | undefined;

export const readPostBodyFile: ReadPostBody = (id, locale) => {
  const path = join(POSTS_DIRECTORY, `${id}.${locale}.md`);
  return existsSync(path) ? readFileSync(path, 'utf8') : undefined;
};

/**
 * The content with every post's `body` attached: an object holding the
 * locales whose file exists, so validation names each one that does not.
 */
export function withPostBodies(
  content: Readonly<Record<string, readonly unknown[]>>,
  readBody: ReadPostBody = readPostBodyFile,
): Readonly<Record<string, readonly unknown[]>> {
  const posts = content['posts.json'] ?? [];
  return {
    ...content,
    'posts.json': posts.map(record => {
      if (record === null || typeof record !== 'object') return record;
      const { id } = record as { id?: unknown };
      if (typeof id !== 'string') return record;
      const body = Object.fromEntries(
        SITE_LOCALES.flatMap(locale => {
          const text = readBody(id, locale);
          return text === undefined ? [] : [[locale, text]];
        }),
      );
      return { ...record, body };
    }),
  };
}
