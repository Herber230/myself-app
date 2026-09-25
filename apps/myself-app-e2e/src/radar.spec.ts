import { expect, test } from '@playwright/test';

/**
 * The radar as the export writes it. The geometry is covered by unit tests;
 * what only a browser can answer is that the picture is in the HTML, that it
 * carries an accessible name, and that the legend says the same thing in text.
 */

const LOCALES = [
  { locale: 'en', legend: 'Every blip, by quadrant and ring', ring: 'Adopt' },
  {
    locale: 'es',
    legend: 'Cada punto, por cuadrante y anillo',
    ring: 'Adoptar',
  },
];

for (const { locale, legend, ring } of LOCALES) {
  test(`/${locale}/tech-radar/ draws the radar and lists it`, async ({
    page,
  }) => {
    await page.goto(`/${locale}/tech-radar/`);

    const radar = page.getByRole('img');
    await expect(radar).toBeVisible();
    await expect(radar).toHaveAttribute('aria-label', /radar/i);

    await expect(
      page.getByRole('heading', { level: 2, name: legend }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 4, name: ring }),
    ).toHaveCount(4);

    // Every blip in the picture is a row in the legend, and no more.
    const blips = await radar.locator('g[transform^="translate"]').count();
    expect(blips).toBeGreaterThanOrEqual(16);
    await expect(page.locator('section[aria-labelledby] li')).toHaveCount(
      blips,
    );
  });
}

test('the radar needs no JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/en/tech-radar/');

  await expect(page.getByRole('img')).toBeVisible();
  await expect(page.getByText('Trunk-based development')).toBeVisible();

  await context.close();
});

test('the export carries the radar as JSON, and it matches the page', async ({
  page,
  request,
}) => {
  // Path C of ADR 0003: nothing reads these files yet, but they are the seam
  // a browser-side filter or a backend adapter would read, and a file that
  // disagreed with the page beside it would go unnoticed until then.
  const response = await request.get('/data/technology.json');
  expect(response.ok()).toBe(true);
  expect(response.headers()['content-type']).toContain('application/json');
  const technologies = (await response.json()) as {
    id: string;
    name: { en: string; es: string };
  }[];
  expect(technologies.length).toBeGreaterThanOrEqual(16);

  await page.goto('/es/tech-radar/');
  const legend = page.locator('section[aria-labelledby] li');
  await expect(legend).toHaveCount(technologies.length);
  for (const technology of technologies) {
    await expect(
      page.getByText(technology.name.es, { exact: true }),
      technology.id,
    ).toHaveCount(1);
  }
});

test("a technology's page links back to the radar and on to its projects", async ({
  page,
}) => {
  await page.goto('/en/tech-radar/typescript/');
  await expect(
    page.getByRole('heading', { level: 1, name: 'TypeScript' }),
  ).toBeVisible();

  await page.getByRole('link', { name: 'myself-app' }).click();
  await page.waitForURL('/en/#project-myself-app');
  await expect(page.locator('#project-myself-app')).toBeInViewport();

  await page.goto('/es/tech-radar/typescript/');
  await page.getByRole('link', { name: '← Volver al radar' }).click();
  await page.waitForURL('/es/tech-radar/#tech-typescript');
  await expect(page.locator('#tech-typescript')).toBeInViewport();
});

test("a technology's page needs no JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/en/tech-radar/next-js/');
  await expect(
    page.getByRole('heading', { level: 2, name: 'How it moved' }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Website' })).toHaveAttribute(
    'href',
    'https://nextjs.org',
  );
  await context.close();
});
