import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { workspaceRoot } from '@nx/devkit';
import { expect, test } from '@playwright/test';

/**
 * The social preview images (#50): one per locale, drawn at build, named by
 * every page of that locale, and none of their drawing code in the browser.
 */

for (const locale of ['en', 'es']) {
  for (const [kind, attribute] of [
    ['opengraph-image', 'property="og:image"'],
    ['twitter-image', 'name="twitter:image"'],
  ] as const) {
    test(`/${locale}/ names its own ${kind}, and it is a PNG`, async ({
      page,
      request,
    }) => {
      await page.goto(`/${locale}/`);
      const content = await page
        .locator(`meta[${attribute}]`)
        .getAttribute('content');
      // Absolute on the site's URL, which is not this server's until the
      // domain is set (#45): the path is what this export can answer.
      const url = new URL(content ?? '');
      expect(url.pathname).toBe(`/${locale}/${kind}`);

      const response = await request.get(url.pathname);
      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toBe('image/png');
      const body = await response.body();
      expect([...body.subarray(1, 4)]).toEqual([0x50, 0x4e, 0x47]);
    });
  }
}

test('no client chunk carries the image renderer', () => {
  const statics = join(workspaceRoot, 'apps/myself-app/out/_next/static');
  const scripts = readdirSync(statics, { recursive: true, encoding: 'utf8' })
    .filter(file => file.endsWith('.js'))
    .map(file => readFileSync(join(statics, file), 'utf8'));
  expect(scripts.length).toBeGreaterThan(0);
  for (const script of scripts) {
    expect(script).not.toMatch(/satori|resvg|@vercel\/og/);
  }
});
