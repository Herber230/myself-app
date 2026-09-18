import { expect, test } from '@playwright/test';

/**
 * The prebuilt CV PDFs (#37), rendered after the export by
 * `tools/render-pdfs.mjs` and served from beside their page.
 */
for (const locale of ['en', 'es']) {
  test(`/${locale}/cv/ has its PDF beside it`, async ({ request }) => {
    const response = await request.get(
      `/${locale}/cv/herber-colop-cv-${locale}.pdf`,
    );
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toBe('application/pdf');
    const body = await response.body();
    expect(body.subarray(0, 5).toString()).toBe('%PDF-');
  });
}
