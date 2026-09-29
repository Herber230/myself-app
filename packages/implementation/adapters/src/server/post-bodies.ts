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
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

import type { ReadSidecar } from '@myself-app/entifix-incubator-static-adapter';

/** The folder a package lives in, resolved from another's. */
function packageFolder(name: string, from: string): string {
  return dirname(
    createRequire(join(from, 'package.json')).resolve(`${name}/package.json`),
  );
}

/**
 * Where the bodies are. Build and test run in a package's folder — the app's,
 * or this one's — and both resolve this package by name (the app depends on
 * it; a package may name itself). From here, the content package is this
 * package's own dependency, so the app need not depend on it (#75).
 */
const POSTS_DIRECTORY = join(
  packageFolder(
    '@myself-app/content',
    packageFolder('@myself-app/implementation-adapters', process.cwd()),
  ),
  'src',
  'posts',
);

/** The Markdown of one post in one locale, or `undefined` when there is none. */
export const readPostBodyFile: ReadSidecar = (id, locale) => {
  const path = join(POSTS_DIRECTORY, `${id}.${locale}.md`);
  return existsSync(path) ? readFileSync(path, 'utf8') : undefined;
};
