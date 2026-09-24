#!/usr/bin/env node
/**
 * Renders every CV page of a static export to PDF, and writes each beside its
 * page (#37, ADR 0012).
 *
 *   node tools/render-pdfs.mjs <directory> [port]
 *
 * The export is served by `serve-static.mjs`, as the bucket would serve it, and
 * printed by Playwright's Chromium: the same file for every visitor, whatever
 * their browser's print settings. The pages are found in the export itself —
 * every `index.html` under `<locale>/cv/` — so no list of variants is kept
 * here.
 *
 * Each page names its own PDF: its Download link (`a[data-cv-pdf]`) carries the
 * file name as its `href`, and the metadata as `data-pdf-*`. The file is
 * written there and stamped with them, so a page and its PDF cannot disagree.
 * `/en/cv/backend/ats/` becomes `en/cv/backend/ats/herber-colop-cv-backend-en-ats.pdf`.
 */
import { spawn } from 'node:child_process';
import { globSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import { readFile, writeFile } from 'node:fs/promises';

import { chromium } from '@playwright/test';
import { PDFDocument } from 'pdf-lib';

const [directory, port = '3300'] = process.argv.slice(2);
if (!directory) {
  console.error('usage: node tools/render-pdfs.mjs <directory> [port]');
  process.exit(1);
}
const root = resolve(directory);
const origin = `http://localhost:${port}`;

/** Every CV page in the export, as its path: `en/cv/`, `en/cv/backend/ats/`. */
const pages = globSync('*/cv/**/index.html', { cwd: root })
  .map(file => `${dirname(file)}/`)
  .sort();
if (pages.length === 0) {
  console.error(`no CV page under ${root}: build the export first`);
  process.exit(1);
}

/** What the page's Download link says about its PDF. */
function pdfOf(page) {
  return page.locator('a[data-cv-pdf]').evaluate(link => ({
    name: link.getAttribute('href'),
    title: link.dataset.pdfTitle,
    author: link.dataset.pdfAuthor,
    subject: link.dataset.pdfSubject,
    keywords: link.dataset.pdfKeywords,
    language: link.dataset.pdfLanguage,
  }));
}

/** Sets a PDF's document information, which Chromium leaves to the title. */
async function stamp(file, pdf) {
  const document = await PDFDocument.load(await readFile(file));
  document.setTitle(pdf.title, { showInWindowTitleBar: true });
  document.setAuthor(pdf.author);
  document.setSubject(pdf.subject);
  // One entry: pdf-lib joins a list with spaces, which would split names.
  document.setKeywords([pdf.keywords]);
  document.setLanguage(pdf.language);
  document.setCreator(`${pdf.author}'s site`);
  await writeFile(file, await document.save());
}

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
      const pdf = await pdfOf(page);
      const output = join(root, path, pdf.name);
      await page.pdf({
        path: output,
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
      });
      await stamp(output, pdf);
      console.log(`/${path} → ${output}`);
    }
  } finally {
    await browser.close();
  }
} finally {
  server.kill();
}
