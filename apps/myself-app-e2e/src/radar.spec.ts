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
  await expect(
    page.getByRole('link', { name: 'Trunk-based development' }),
  ).toBeVisible();

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

test("a blip opens its technology's page, and names itself on hover", async ({
  page,
}) => {
  await page.goto('/en/tech-radar/');
  const blip = page.locator('a[data-blip="typescript"]');
  await expect(blip.locator('title')).toHaveText(/^\d+\. TypeScript$/);
  await blip.click();
  await page.waitForURL('/en/tech-radar/typescript/');
});

test('the legend reaches every technology with a keyboard', async ({
  page,
}) => {
  await page.goto('/en/tech-radar/');
  const legend = page.locator('section[aria-labelledby] li');
  // One link per entry, and no blip in the tab order to duplicate it.
  await expect(legend.getByRole('link')).toHaveCount(await legend.count());
  await expect(page.locator('a[data-blip]:not([tabindex="-1"])')).toHaveCount(
    0,
  );
  const link = legend.getByRole('link', { name: 'Next.js' });
  await link.focus();
  await page.keyboard.press('Enter');
  await page.waitForURL('/en/tech-radar/next-js/');
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('the legend comes before the picture, and nothing scrolls sideways', async ({
    page,
  }) => {
    await page.goto('/en/tech-radar/');
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(375);
    const legendTop = await page
      .getByRole('heading', {
        level: 2,
        name: 'Every blip, by quadrant and ring',
      })
      .evaluate(element => element.getBoundingClientRect().top);
    const chartTop = await page
      .getByRole('img')
      .evaluate(element => element.getBoundingClientRect().top);
    expect(legendTop).toBeLessThan(chartTop);
  });
});

test.describe('the filter', () => {
  test('by one area keeps its technologies, and dims the rest in place', async ({
    page,
  }) => {
    await page.goto('/en/tech-radar/');
    const blips = page.locator('a[data-blip]');
    const total = await blips.count();
    await page
      .getByRole('group', { name: 'Area' })
      .getByRole('button', { name: 'Monorepo' })
      .click();
    await expect(page).toHaveURL('/en/tech-radar/?area=monorepo');
    await expect(page.locator('a[data-blip]:not([data-dimmed])')).toHaveCount(
      3,
    );
    await expect(page.locator('a[data-blip="nx"]')).not.toHaveAttribute(
      'data-dimmed',
    );
    // Dimmed, not removed: the radar keeps its shape.
    await expect(blips).toHaveCount(total);
    await expect(page.getByText(`Showing 3 of ${total}`)).toBeVisible();
  });

  test('is read from the URL, and survives a reload', async ({ page }) => {
    await page.goto('/es/tech-radar/?ring=adopt&q=type');
    await expect(page.locator('a[data-blip]:not([data-dimmed])')).toHaveCount(
      1,
    );
    await expect(
      page.getByRole('group', { name: 'Anillo' }).getByRole('button', {
        name: 'Adoptar',
      }),
    ).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('searchbox')).toHaveValue('type');

    await page.reload();
    await expect(page.locator('a[data-blip]:not([data-dimmed])')).toHaveCount(
      1,
    );
    await page.getByRole('button', { name: 'Mostrar todo' }).click();
    await expect(page).toHaveURL('/es/tech-radar/');
    await expect(page.locator('a[data-blip][data-dimmed]')).toHaveCount(0);
  });

  test('hovering a legend entry marks its blip', async ({ page }) => {
    await page.goto('/en/tech-radar/');
    await page.getByRole('link', { name: 'TypeScript' }).hover();
    await expect(page.locator('a[data-blip="typescript"]')).toHaveAttribute(
      'data-highlighted',
    );
  });
});
