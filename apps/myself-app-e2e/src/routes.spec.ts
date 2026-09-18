import { expect, test } from '@playwright/test';

/**
 * Every route the export writes, answered the way a bucket answers it.
 */

test('`/` moves to the default locale without a server redirect', async ({
  page,
}) => {
  const response = await page.goto('/');
  // The root itself is a page: the move is its meta refresh, not a 3xx.
  expect(response?.status()).toBe(200);

  await page.waitForURL('/en/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Herber Colop' }),
  ).toBeVisible();
});

test.describe('each locale renders its own pages', () => {
  const locales = [
    {
      locale: 'en',
      home: 'Home',
      cv: 'CV',
      techRadar: 'Tech radar',
      other: 'Español',
      otherLocale: 'es',
    },
    {
      locale: 'es',
      home: 'Inicio',
      cv: 'CV',
      techRadar: 'Radar tecnológico',
      other: 'English',
      otherLocale: 'en',
    },
  ];

  for (const { locale, home, cv, techRadar, other, otherLocale } of locales) {
    test(`/${locale}/`, async ({ page }) => {
      const response = await page.goto(`/${locale}/`);
      expect(response?.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', locale);

      const nav = page.getByRole('navigation');
      await expect(nav.getByRole('link', { name: home })).toBeVisible();

      await nav.getByRole('link', { name: cv, exact: true }).click();
      await page.waitForURL(`/${locale}/cv/`);
      await expect(
        page.getByRole('heading', { level: 1, name: cv }),
      ).toBeVisible();

      await nav.getByRole('link', { name: techRadar }).click();
      await page.waitForURL(`/${locale}/tech-radar/`);
      await expect(
        page.getByRole('heading', { level: 1, name: techRadar }),
      ).toBeVisible();

      // The language switch keeps the page.
      await nav.getByRole('link', { name: other }).click();
      await page.waitForURL(`/${otherLocale}/tech-radar/`);
      await expect(page.locator('html')).toHaveAttribute('lang', otherLocale);
    });
  }
});

test('a folder without its trailing slash is sent to it, as S3 does', async ({
  request,
}) => {
  const response = await request.get('/en', { maxRedirects: 0 });
  expect(response.status()).toBe(302);
  expect(response.headers()['location']).toBe('/en/');
});

test('an unknown path answers the bilingual 404 page', async ({ page }) => {
  const response = await page.goto('/this-page-does-not-exist/');
  expect(response?.status()).toBe(404);

  await expect(
    page.getByRole('heading', { level: 1, name: 'Page not found' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 1, name: 'Página no encontrada' }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Home' })).toHaveAttribute(
    'href',
    '/en/',
  );
  await expect(page.getByRole('link', { name: 'Inicio' })).toHaveAttribute(
    'href',
    '/es/',
  );
});

test('the sitemap lists every page in every locale, and robots.txt points at it', async ({
  request,
}) => {
  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.status()).toBe(200);
  expect(sitemap.headers()['content-type']).toContain('application/xml');
  const xml = await sitemap.text();
  for (const locale of ['en', 'es']) {
    for (const path of ['', 'cv/', 'tech-radar/']) {
      expect(xml).toContain(`/${locale}/${path}</loc>`);
    }
  }

  const robots = await request.get('/robots.txt');
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toMatch(/^Sitemap: .*\/sitemap\.xml$/m);
});
