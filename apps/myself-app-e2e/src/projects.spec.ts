import { expect, type Page, test } from '@playwright/test';

/**
 * A project's page and its decision records (#77, ADR 0020).
 */

const records = (page: Page) =>
  page.locator('[data-slot="split-row"] [data-adr]');
const pane = (page: Page) => page.locator('[data-slot="split-detail"]');
const dot = (page: Page, number: string) =>
  page
    .getByRole('group', { name: 'The records in the order they were decided' })
    .getByRole('button', { name: new RegExp(`^${number} · `) });

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
  await expect(records(page)).toHaveCount(21);
  // A technology leads to its page on the radar.
  await page.getByRole('link', { name: 'Pulumi', exact: true }).click();
  await page.waitForURL('/en/tech-radar/pulumi/');
});

test('the records filter and sort in the URL, through a reload', async ({
  page,
}) => {
  await page.goto('/en/projects/myself-app/');
  await page
    .getByRole('button', { name: 'Superseded in part', exact: true })
    .click();
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

test('the pane shows a record, chosen by the keys, the timeline or the URL', async ({
  page,
}) => {
  await page.goto('/en/projects/myself-app/');
  await expect(pane(page).getByRole('heading', { level: 3 })).toContainText(
    '0001',
  );
  await page.getByRole('link', { name: /^0001/ }).focus();
  await page.keyboard.press('ArrowDown');
  await expect(page).toHaveURL(/\?adr=0002$/);
  await expect(page.getByRole('link', { name: /^0002/ })).toBeFocused();

  await dot(page, '0016').click();
  await expect(page).toHaveURL(/\?adr=0016$/);
  await expect(pane(page)).toContainText('The query string declares');
  await page.reload();
  await expect(dot(page, '0016')).toHaveAttribute('aria-pressed', 'true');

  // A filter that hides the chosen record: the pane shows the first kept.
  await page
    .getByRole('button', { name: 'Superseded in part', exact: true })
    .click();
  await expect(pane(page).getByRole('heading', { level: 3 })).toContainText(
    '0008',
  );
  await expect(dot(page, '0016')).toHaveAttribute('data-dimmed', '');
});

test('the practice is told on request, and stays open once opened', async ({
  page,
}) => {
  await page.goto('/en/projects/entifix/');
  const practice = page.locator('details.adr-practice');
  await expect(practice).not.toHaveAttribute('open');
  // Hydrated: the explorer's controls render only then.
  await expect(page.getByRole('searchbox')).toBeVisible();
  await page.getByText('How the records steer the work').click();
  await expect(practice).toHaveAttribute('open', '');
  await expect(page.locator('.adr-step')).toHaveCount(5);
  // `toggle` is dispatched after the change, in a task of its own.
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('decision-practice')))
    .toBe('open');
  await page.reload();
  await expect(practice).toHaveAttribute('open', '');
});

test('the filter card counts what is in force, and a chip removes it', async ({
  page,
}) => {
  await page.goto('/en/projects/myself-app/?status=accepted&area=ui');
  await expect(page.getByText('2 active')).toBeVisible();
  await page.getByRole('button', { name: 'Remove Area: ui' }).click();
  await expect(page).toHaveURL(/\?status=accepted$/);
  await expect(page.getByText('1 active')).toBeVisible();
});

test('the outline beside the page follows the section being read', async ({
  page,
}) => {
  await page.goto('/en/projects/myself-app/');
  const outline = page.getByRole('navigation', { name: 'On this page' });
  await outline.getByRole('link', { name: 'File structure' }).click();
  await expect(page).toHaveURL(/#structure$/);
  await expect(
    outline.getByRole('link', { name: 'File structure' }),
  ).toHaveAttribute('aria-current', 'location');
});

test('a record’s outline jumps to its own headings', async ({ page }) => {
  await page.goto('/en/projects/myself-app/adr/0016/');
  const outline = page.getByRole('navigation', { name: 'On this page' });
  await outline.getByRole('link', { name: 'Consequences' }).click();
  await expect(page).toHaveURL(/#consequences$/);
  await expect(page.locator('#consequences')).toBeInViewport();
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('the chosen record opens under its row, as an accordion', async ({
    page,
  }) => {
    await page.goto('/en/projects/myself-app/?adr=0003');
    const row = page.locator('[data-slot="split-row"]', {
      has: page.locator('[data-adr="myself-app-0003"]'),
    });
    await expect(row.locator('[data-slot="split-detail"]')).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(390);
  });

  test('the outline is a strip held at the top, its current link in sight', async ({
    page,
  }) => {
    await page.goto('/en/projects/myself-app/');
    const strip = page.locator('.outline-layout-aside');
    await page.locator('#decisions').scrollIntoViewIfNeeded();
    await expect(strip).toBeInViewport();
    expect(
      await strip.evaluate(element => element.getBoundingClientRect().top),
    ).toBe(0);
    const current = page
      .getByRole('navigation', { name: 'On this page' })
      .getByRole('link', { name: 'Architecture decisions' });
    await expect(current).toHaveAttribute('aria-current', 'location');
    await expect(current).toBeInViewport();
    expect((await current.boundingBox())?.height).toBeGreaterThanOrEqual(44);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(390);
  });
});

test.describe('with scripting off', () => {
  test.use({ javaScriptEnabled: false });

  test('each record is a link to its page', async ({ page }) => {
    await page.goto('/en/projects/myself-app/');
    await page.getByRole('link', { name: /^0016/ }).click();
    await page.waitForURL('/en/projects/myself-app/adr/0016/');
  });
});
