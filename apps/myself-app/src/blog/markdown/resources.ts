/**
 * A post's images and links, checked and rewritten at build (ADR 0017).
 *
 * - An image lives beside its post, in `public/blog/<post>/`, and is written
 *   relative to it (`./radar.png`). It must exist and say what it shows, and
 *   its size is written into the page so nothing moves as it loads. Every
 *   image loads lazily.
 * - An internal link is written without a locale (`/tech-radar/nx/`), ends in
 *   `/`, and names a page the site has. The reader's locale is added.
 * - An external link opens with no access to this page.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { imageSize } from 'image-size';
import type { Root } from 'mdast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

import { localePath } from '../../locale-path';
import type { SiteLocale } from '../../site-locales';
import { PostContentError } from './problem';

export interface ResourceContext {
  /** Where the post is, for a problem's message: `posts/<id>.<locale>.md`. */
  readonly source: string;
  readonly post: string;
  readonly locale: SiteLocale;
  /** Every page the site has, locale-free, without its trailing slash. */
  readonly sitePaths: ReadonlySet<string>;
  /** The app's `public/` folder, which the export serves from its root. */
  readonly publicDirectory: string;
}

const EXTERNAL = /^[a-z][a-z0-9+.-]*:/i;

function readImage(path: string): Buffer | undefined {
  try {
    return readFileSync(path);
  } catch {
    return undefined;
  }
}

export const remarkPostResources: Plugin<[ResourceContext], Root> =
  ({ source, post, locale, sitePaths, publicDirectory }) =>
  tree => {
    visit(tree, 'image', node => {
      if (!node.url.startsWith('./')) {
        throw new PostContentError(
          source,
          node,
          `links an image at "${node.url}": images live beside the post, as ./<file>`,
        );
      }
      if (!node.alt?.trim()) {
        throw new PostContentError(
          source,
          node,
          `has an image without alt text: ${node.url}`,
        );
      }
      const url = `/blog/${post}/${node.url.slice(2)}`;
      const bytes = readImage(join(publicDirectory, url));
      if (bytes === undefined) {
        throw new PostContentError(
          source,
          node,
          `links an image that does not exist: public${url}`,
        );
      }
      const { width, height } = imageSize(bytes);
      node.url = url;
      node.data = {
        // Lazy even the first: a post's page is prefetched from the blog's
        // home, and React preloads every eager image of a prefetched page.
        hProperties: { width, height, decoding: 'async', loading: 'lazy' },
      };
    });

    visit(tree, 'link', node => {
      if (node.url.startsWith('#')) return;
      if (EXTERNAL.test(node.url)) {
        node.data = { hProperties: { rel: ['noopener', 'noreferrer'] } };
        return;
      }
      if (!node.url.startsWith('/')) {
        throw new PostContentError(
          source,
          node,
          `links "${node.url}": a link within the site starts with /`,
        );
      }
      const cut = node.url.search(/[?#]/);
      const path = cut === -1 ? node.url : node.url.slice(0, cut);
      const rest = cut === -1 ? '' : node.url.slice(cut);
      if (!path.endsWith('/')) {
        throw new PostContentError(
          source,
          node,
          `links "${node.url}", which needs its trailing slash`,
        );
      }
      const page = path === '/' ? '/' : path.slice(0, -1);
      if (!sitePaths.has(page)) {
        throw new PostContentError(
          source,
          node,
          `links "${node.url}", a page the site does not have`,
        );
      }
      node.url = `${localePath(locale, page)}${rest}`;
    });
  };
