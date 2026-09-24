import { expect, test } from '@playwright/test';

/**
 * The prebuilt CV PDFs (#37, ADR 0012), rendered after the export by
 * `tools/render-pdfs.mjs` and served from beside their page. Every page's
 * Download link names its file.
 */
const VARIANTS = ['', 'backend/', 'frontend/', 'devops/'];
const PAGES = ['en', 'es'].flatMap(locale =>
  VARIANTS.flatMap(variant =>
    ['', 'ats/'].map(mode => `/${locale}/cv/${variant}${mode}`),
  ),
);

for (const path of PAGES) {
  test(`${path} links its PDF, and the PDF is there`, async ({
    page,
    request,
  }) => {
    await page.goto(path);
    const href = await page
      .locator('a[data-cv-pdf]')
      .evaluate(link => (link as HTMLAnchorElement).href);
    expect(href).toMatch(/\/herber-colop-cv-[a-z-]+\.pdf$/);

    const response = await request.get(href);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toBe('application/pdf');
    const body = await response.body();
    expect(body.subarray(0, 5).toString()).toBe('%PDF-');
  });
}
