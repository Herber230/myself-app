/**
 * Markdown read from beside the records: a post's body (ADR 0017, 0018), a
 * project's overview and a decision record's body (#77).
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

import type {
  ReadPlainSidecar,
  ReadSidecar,
} from '@myself-app/entifix-incubator-static-adapter';

/** The folder a package lives in, resolved from another's. */
function packageFolder(name: string, from: string): string {
  return dirname(
    createRequire(join(from, 'package.json')).resolve(`${name}/package.json`),
  );
}

/**
 * The content package's `src/`. Build and test run in a package's folder —
 * the app's, or this one's — and both resolve this package by name (the app
 * depends on it; a package may name itself). From here, the content package is
 * this package's own dependency, so the app need not depend on it (#75).
 */
const CONTENT_DIRECTORY = join(
  packageFolder(
    '@myself-app/content',
    packageFolder('@myself-app/implementation-adapters', process.cwd()),
  ),
  'src',
);

/** A file's text, or `undefined` when there is no such file. */
function readText(path: string): string | undefined {
  return existsSync(path) ? readFileSync(path, 'utf8') : undefined;
}

/** A reader of `<folder>/<id>.<locale>.md`: a localized member's Markdown. */
export function localizedMarkdownIn(folder: string): ReadSidecar {
  return (id, locale) =>
    readText(join(CONTENT_DIRECTORY, folder, `${id}.${locale}.md`));
}

/** A reader of `<folder>/<id>.md`: Markdown written in one language (#77). */
export function markdownIn(folder: string): ReadPlainSidecar {
  return id => readText(join(CONTENT_DIRECTORY, folder, `${id}.md`));
}

/** The Markdown of one post in one locale, or `undefined` when there is none. */
export const readPostBodyFile: ReadSidecar = localizedMarkdownIn('posts');

/** A project's overview in one locale (#77): `projects/<id>.<locale>.md`. */
export const readProjectOverviewFile: ReadSidecar =
  localizedMarkdownIn('projects');

/** A decision record's body, in English only (#77): `adrs/<id>.md`. */
/** An interest's section on the "Beyond the code" page. */
export const readInterestBodyFile: ReadSidecar =
  localizedMarkdownIn('interests');

export const readDecisionBodyFile: ReadPlainSidecar = markdownIn('adrs');
