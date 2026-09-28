/**
 * A post's body, read from its Markdown files (ADR 0017, 0018).
 *
 * `posts.json` holds what a post is; `posts/<id>.<locale>.md` holds what it
 * says. The content package imports nothing, so it cannot read them, and the
 * static adapter is bundled for the browser too, so it reads no file: this
 * is the reader the posts' source hands it as a sidecar. It attaches each body
 * before validation, so a missing locale fails the build with the post's path,
 * and a placeholder in a body is found like any other.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { ReadSidecar } from '@myself-app/static-adapter';

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
export const readPostBodyFile: ReadSidecar = (id, locale) => {
  const path = join(POSTS_DIRECTORY, `${id}.${locale}.md`);
  return existsSync(path) ? readFileSync(path, 'utf8') : undefined;
};
