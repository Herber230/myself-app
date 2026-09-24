import {
  type APIRequestContext,
  expect,
  type Page,
  test,
} from '@playwright/test';

import { readPdf, squeezed } from './pdf-text';

/**
 * The prebuilt CV PDFs (#37, ADR 0012), rendered after the export by
 * `tools/render-pdfs.mjs` and served beside their page. Each is one A4 page,
 * carries its metadata, and says in its text layer everything its sheet shows
 * — the headings in the order a parser expects them, and in the ATS mode every
 * contact as a full address. "ATS optimized" is this gate, not a claim.
 */
const HEADINGS = {
  en: [
    'Summary',
    'Technical skills',
    'Experience',
    'Education',
    'Certificates',
  ],
  es: [
    'Resumen',
    'Habilidades técnicas',
    'Experiencia',
    'Educación',
    'Certificaciones',
  ],
} as const;

const VARIANTS = ['', 'backend/', 'frontend/', 'devops/'];
const PAGES = (['en', 'es'] as const).flatMap(locale =>
  VARIANTS.flatMap(variant =>
    (['', 'ats/'] as const).map(mode => ({
      locale,
      ats: mode === 'ats/',
      path: `/${locale}/cv/${variant}${mode}`,
    })),
  ),
);

/** The PDF a CV page links, read. */
async function pdfOf(page: Page, request: APIRequestContext, path: string) {
  await page.goto(path);
  const href = await page
    .locator('a[data-cv-pdf]')
    .evaluate(link => (link as HTMLAnchorElement).href);
  expect(href).toMatch(/\/herber-colop-cv-[a-z-]+\.pdf$/);
  const response = await request.get(href);
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toBe('application/pdf');
  return readPdf(await response.body());
}

/** The texts of every element the sheet shows under `selector`. */
const textsOf = (page: Page, selector: string) =>
  page
    .locator(`article.cv-sheet ${selector}`)
    .evaluateAll(elements => elements.map(each => each.textContent ?? ''));

for (const { locale, path } of PAGES) {
  test(`${path} has its PDF: one page, its metadata, and all of its text`, async ({
    page,
    request,
  }) => {
    const pdf = await pdfOf(page, request, path);

    expect(pdf.pages, 'a CV is one page').toBe(1);
    expect(pdf.info['Author']).toBe('Herber Colop');
    expect(pdf.info['Title']).toMatch(/^Herber Colop — CV \(/);
    expect(pdf.info['Language']).toBe(locale);

    // The headings, in order.
    const positions = HEADINGS[locale].map(heading =>
      pdf.text.indexOf(heading.toUpperCase()),
    );
    expect(positions.every(position => position >= 0)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);

    // Everything the sheet lists is in the text layer, word for word.
    const text = squeezed(pdf.text);
    for (const shown of [
      'Herber Colop',
      ...(await textsOf(page, '.cv-role')),
      ...(await textsOf(page, '.cv-list li')),
      ...(await textsOf(page, '.cv-meta')),
    ]) {
      expect(text).toContain(squeezed(shown));
    }
  });
}

for (const { path } of PAGES.filter(each => each.ats)) {
  test(`${path} writes each contact as a full address`, async ({
    page,
    request,
  }) => {
    const pdf = await pdfOf(page, request, path);
    for (const address of [
      'herbercolop@gmail.com',
      'github.com/Herber230',
      'linkedin.com/in/',
    ]) {
      expect(pdf.text).toContain(address);
    }
  });
}
