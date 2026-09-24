import { expect, test } from '@playwright/test';

/**
 * The CV's pages (ADR 0012): a variant switcher and a mode toggle that keep
 * each other and the locale, and an ATS page that search engines skip.
 */

test('the switcher and the toggle keep each other, and the language switch keeps both', async ({
  page,
}) => {
  await page.goto('/en/cv/');
  const sheet = page.locator('article.cv-sheet');
  await expect(sheet).toHaveAttribute('data-mode', 'human');

  const reading = page.getByRole('navigation', { name: 'Reading' });
  await expect(reading.getByRole('listitem')).toHaveCount(4);
  await expect(reading.locator('[aria-current="page"]')).toHaveCount(1);
  await reading.locator('a[href="/en/cv/backend/"]').click();
  await page.waitForURL('/en/cv/backend/');

  const mode = page.getByRole('navigation', { name: 'Written for' });
  await mode.getByRole('link', { name: 'Applicant tracking systems' }).click();
  await page.waitForURL('/en/cv/backend/ats/');
  await expect(sheet).toHaveAttribute('data-mode', 'ats');

  // Another reading, still in the ATS mode.
  await page
    .getByRole('navigation', { name: 'Reading' })
    .locator('a[href="/en/cv/devops/ats/"]')
    .click();
  await page.waitForURL('/en/cv/devops/ats/');

  const nav = page.getByRole('banner');
  await nav.getByLabel('Language', { exact: true }).click();
  await nav.getByRole('link', { name: 'Español' }).click();
  await page.waitForURL('/es/cv/devops/ats/');
  await expect(
    page.getByRole('heading', { level: 2, name: 'Experiencia' }),
  ).toBeVisible();
});

test('an ATS page is not indexed, and names its human page as canonical', async ({
  page,
}) => {
  await page.goto('/es/cv/frontend/ats/');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    /noindex/,
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    /\/es\/cv\/frontend\/$/,
  );
});

test('the default variant has no second URL, and an unknown one is not found', async ({
  request,
}) => {
  expect((await request.get('/en/cv/full-stack/')).status()).toBe(404);
  expect((await request.get('/en/cv/astronaut/')).status()).toBe(404);
  expect((await request.get('/en/cv/ats/')).status()).toBe(200);
});
