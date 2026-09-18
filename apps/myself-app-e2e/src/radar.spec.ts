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
    const rows = await page.locator('section[aria-labelledby] li').count();
    expect(blips).toBeGreaterThanOrEqual(16);
    expect(rows).toBe(blips);
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
