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

test('a project’s page shows its patterns, its views and every record', async ({
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
    page.getByRole('group', { name: 'Ports and adapters' }),
  ).toBeVisible();
  await expect(
    page.getByRole('group', { name: 'Packages by layer' }),
  ).toBeVisible();
  await expect(
    page.getByRole('group', { name: 'Delivery pipeline' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 2, name: 'Decision archive' }),
  ).toBeVisible();
  await expect(records(page)).toHaveCount(23);
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
    'myself-app-0022',
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

test('the lifecycle opens on request, stays open, and drives the explorer in place', async ({
  page,
}) => {
  await page.goto('/en/projects/entifix/');
  const band = page.locator('#lifecycle details');
  await expect(band).not.toHaveAttribute('open');
  await expect(page.getByText('See how it works')).toBeVisible();
  // Hydrated: the explorer's controls render only then.
  await expect(page.getByRole('searchbox')).toBeVisible();
  await page.locator('#lifecycle summary').click();
  await expect(band).toHaveAttribute('open', '');
  await expect(page.locator('.step-loop-step')).toHaveCount(4);
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('decision-lifecycle')))
    .toBe('open');

  // A state chosen shows its own panel, and only it.
  await page
    .locator('#lifecycle .state-path-state', { hasText: /^\d+Accepted/ })
    .click();
  await expect(
    page.locator('#lifecycle input[value="accepted"]'),
  ).toBeChecked();
  const shown = page.locator('.state-path-panel:visible');
  await expect(shown).toHaveCount(1);
  await expect(shown).toContainText('The rule.');

  // Its records, asked of the explorer below, with no page load.
  await page.evaluate(() => ((window as { stayed?: boolean }).stayed = true));
  await shown.getByRole('link', { name: /^See all/ }).click();
  await expect(page).toHaveURL(/\?status=accepted#decisions$/);
  await expect(page.getByText('Showing 4 of 4')).toBeVisible();
  expect(
    await page.evaluate(() => (window as { stayed?: boolean }).stayed),
  ).toBe(true);

  await page.reload();
  await expect(band).toHaveAttribute('open', '');
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
  await outline.getByRole('link', { name: 'Structure' }).click();
  await expect(page).toHaveURL(/#structure$/);
  await expect(
    outline.getByRole('link', { name: 'Structure' }),
  ).toHaveAttribute('aria-current', 'location');
});

test('the hexagon walks a request through it, a step at a time', async ({
  page,
}) => {
  await page.goto('/en/projects/myself-app/');
  const architecture = page.locator('#architecture');
  await architecture
    .getByRole('combobox', { name: 'Scenario' })
    .selectOption({ label: 'A visitor filters the radar' });
  await expect(architecture.getByText('Step 1 of 6')).toBeVisible();
  await architecture.getByRole('button', { name: 'Next step' }).click();
  await expect(architecture.getByText('Step 2 of 6')).toBeVisible();
  await expect(
    architecture.locator('[data-slot="hexagon-node"][data-state="lit"]'),
  ).toHaveCount(2);
  // The build's adapters fade while the request runs in the browser.
  await expect(
    architecture.getByRole('button', { name: 'Static adapter' }),
  ).toHaveAttribute('data-state', 'dim');
});

test('a package names its folder and what it may import; lint’s refusals are drawn on demand', async ({
  page,
}) => {
  await page.goto('/en/projects/myself-app/');
  const structure = page.locator('#structure');
  await structure.getByRole('button', { name: 'ui', exact: true }).hover();
  await expect(
    structure.getByRole('link', { name: 'packages/implementation/ui/' }),
  ).toBeVisible();
  await structure
    .getByRole('button', { name: 'Show what lint refuses' })
    .click();
  await expect(
    structure.locator('[data-slot="layer-edge"][data-refused]'),
  ).toHaveCount(3);
});

test('a pipeline job names its workflow, and the release decision answers from the release config', async ({
  page,
}) => {
  await page.goto('/en/projects/myself-app/');
  const delivery = page.locator('#delivery');
  await delivery.getByRole('button', { name: 'CI Gate' }).click();
  await expect(
    delivery.getByRole('link', {
      name: '.github/workflows/pull_request_check.yml',
    }),
  ).toBeVisible();
  const release = delivery.locator('.release');
  await release.getByRole('combobox', { name: 'Type' }).selectOption('docs');
  await expect(release.getByText('No release')).toBeVisible();
  // The checkbox is drawn as a track; its label is what a person presses.
  await release.getByText('Breaking change (!)').click();
  await expect(
    release.getByRole('switch', { name: 'Breaking change (!)' }),
  ).toBeChecked();
  await expect(release.getByText(/→ \d+\.0\.0, a major release/)).toBeVisible();
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
      .getByRole('link', { name: 'Decision archive' });
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
