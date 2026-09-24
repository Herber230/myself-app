#!/usr/bin/env node
/**
 * Serves a static export the way the S3 website endpoint does, so a route that
 * only works under `next dev` or `next start` fails here instead of in the
 * bucket.
 *
 *   node tools/serve-static.mjs <directory> [port]
 *
 * - `path/` answers `path/index.html`.
 * - `path` without a trailing slash, where `path/index.html` exists, answers a
 *   302 to `path/` — what S3 does for a "folder".
 * - Anything else missing answers `404.html` with status 404.
 *
 * No rewrites, no redirect rules, no clean URLs: a bucket has none of them.
 */
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { basename, extname, join, normalize, resolve } from 'node:path';

const [directory, port = '3100'] = process.argv.slice(2);
if (!directory) {
  console.error('usage: node tools/serve-static.mjs <directory> [port]');
  process.exit(1);
}
const root = resolve(directory);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
};

// Next writes metadata images without an extension (`en/opengraph-image`).
// A bucket needs their type set on upload too (#45).
const NAMED_TYPES = {
  'opengraph-image': 'image/png',
  'twitter-image': 'image/png',
};

const isFile = path => existsSync(path) && statSync(path).isFile();

const send = (response, status, path) => {
  response.writeHead(status, {
    'content-type':
      TYPES[extname(path)] ??
      NAMED_TYPES[basename(path)] ??
      'application/octet-stream',
  });
  createReadStream(path).pipe(response);
};

createServer((request, response) => {
  const url = new URL(request.url ?? '/', 'http://localhost');
  const pathname = decodeURIComponent(url.pathname);
  // `normalize` + the prefix check keep `..` from leaving the directory.
  const target = normalize(join(root, pathname));
  if (!target.startsWith(root)) {
    response.writeHead(403).end();
    return;
  }

  if (pathname.endsWith('/') && isFile(join(target, 'index.html'))) {
    send(response, 200, join(target, 'index.html'));
  } else if (!pathname.endsWith('/') && isFile(target)) {
    send(response, 200, target);
  } else if (!pathname.endsWith('/') && isFile(join(target, 'index.html'))) {
    response.writeHead(302, { location: `${pathname}/${url.search}` }).end();
  } else if (isFile(join(root, '404.html'))) {
    send(response, 404, join(root, '404.html'));
  } else {
    response.writeHead(404).end();
  }
}).listen(Number(port), () => {
  console.log(`serving ${root} on http://localhost:${port}`);
});
