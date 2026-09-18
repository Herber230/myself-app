#!/usr/bin/env node
/**
 * Renders every CV page of a static export to PDF, and writes each beside its
 * page (#37).
 *
 *   node tools/render-pdfs.mjs <directory> [port]
 *
 * The export is served by `serve-static.mjs`, as the bucket would serve it, and
 * printed by Playwright's Chromium: the same file for every visitor, whatever
 * their browser's print settings. The pages are found in the export itself —
 * every `<locale>/cv/index.html` — so no list of locales is kept here.
 *
 * `/en/cv/` becomes `en/cv/herber-colop-cv-en.pdf`.
 */
import { spawn } from 'node:child_process';
import { globSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import { chromium } from '@playwright/test';

const [directory, port = '3300'] = process.argv.slice(2);
if (!directory) {
  console.error('usage: node tools/render-pdfs.mjs <directory> [port]');
  process.exit(1);
}
const root = resolve(directory);
const origin = `http://localhost:${port}`;

/** Every CV page in the export, as its path: `en/cv/`. */
const pages = globSync('*/cv/index.html', { cwd: root })
  .map(file => `${dirname(file)}/`)
  .sort();
if (pages.length === 0) {
  console.error(`no CV page under ${root}: build the export first`);
  process.exit(1);
}

/** `en/cv/` → `herber-colop-cv-en.pdf`. */
const pdfName = page => `herber-colop-cv-${page.split('/')[0]}.pdf`;

const server = spawn(
  process.execPath,
  [join(import.meta.dirname, 'serve-static.mjs'), root, port],
  { stdio: 'ignore' },
);

/** Waits until the server answers, for at most ten seconds. */
async function serverReady() {
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      await fetch(origin);
      return;
    } catch {
      await new Promise(done => setTimeout(done, 100));
    }
  }
  throw new Error(`the static server did not start on ${origin}`);
}

try {
  await serverReady();
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    for (const path of pages) {
      const response = await page.goto(`${origin}/${path}`, {
        waitUntil: 'networkidle',
      });
      if (response?.status() !== 200) {
        throw new Error(`/${path} answered ${response?.status()}`);
      }
      const output = join(root, path, pdfName(path));
      await page.pdf({
        path: output,
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
      });
      console.log(`/${path} → ${output}`);
    }
  } finally {
    await browser.close();
  }
} finally {
  server.kill();
}
