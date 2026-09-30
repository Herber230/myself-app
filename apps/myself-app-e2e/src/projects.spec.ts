import { expect, type Page, test } from '@playwright/test';

/**
 * A project's page and its decision records (#77, ADR 0020).
 */

const records = (page: Page) => page.locator('li[data-adr]');

test('a project’s page shows its patterns, file tree and every record', async ({
  page,
}) => {
  await page.goto('/en/projects/myself-app/');
  await expect(
    page.getByRole('heading', { level: 1, name: 'myself-app' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 2, name: 'Patterns' }),
  ).toBeVisible();
  await expect(
    page.getByRole('list', { name: 'File structure' }),
  ).toBeVisible();
  await expect(records(page)).toHaveCount(20);
  // A technology leads to its page on the radar.
  await page.getByRole('link', { name: 'Pulumi', exact: true }).click();
  await page.waitForURL('/en/tech-radar/pulumi/');
});

test('the records filter and sort in the URL, through a reload', async ({
  page,
}) => {
  await page.goto('/en/projects/myself-app/');
  await page.getByRole('button', { name: 'Superseded in part' }).click();
  await expect(records(page)).toHaveCount(1);
  await expect(page).toHaveURL(/\?status=superseded-in-part$/);

  await page.getByRole('button', { name: 'Clear filters' }).click();
  await page.getByRole('button', { name: 'Date' }).click();
  await expect(page).toHaveURL(/\?sort=date-desc$/);
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Date, descending' }),
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(records(page).first()).toHaveAttribute(
    'data-adr',
    'myself-app-0020',
  );
});

test('a record links what supersedes it, in both directions', async ({
  page,
}) => {
  await page.goto('/es/projects/myself-app/adr/0008/');
  await expect(page.getByText('Reemplazada en parte').first()).toBeVisible();
  await page.getByRole('link', { name: /^ADR 0011 · / }).click();
  await page.waitForURL('/es/projects/myself-app/adr/0011/');
  await expect(page.getByText('Reemplaza a')).toBeVisible();
  await expect(page.locator('article[lang="en"]')).toBeVisible();
});
