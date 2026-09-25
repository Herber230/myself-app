import { expect, type Page, test } from '@playwright/test';

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

/**
 * Customizing the human sheet (#38, ADR 0015): what is unchecked disappears
 * at once, the URL remembers it, a reload or a shared link opens it hidden
 * before the page hydrates, and print keeps it.
 */
test.describe('a customized sheet', () => {
  const sheet = (page: Page) => page.locator('article.cv-sheet');
  const part = (page: Page, name: string) =>
    sheet(page).locator(`[data-cv-part="${name}"]`);
  const HIDDEN = [
    'section:education',
    'position:vana-frontend-engineer',
    'tech:react',
  ];

  test('hides what is unchecked, and keeps it in the URL', async ({ page }) => {
    await page.goto('/en/cv/');
    await page.getByText('Customize', { exact: true }).click();
    const customize = page.locator('details.cv-customize');
    await customize.getByRole('checkbox', { name: 'Education' }).uncheck();
    await customize
      .getByRole('checkbox', { name: 'Frontend Software Engineer · Vana' })
      .uncheck();
    await customize.getByRole('checkbox', { name: 'React' }).uncheck();

    for (const name of HIDDEN) await expect(part(page, name)).toBeHidden();
    await expect(part(page, 'section:experience')).toBeVisible();
    await expect(
      customize.getByText('The download is the full sheet', { exact: false }),
    ).toBeVisible();
    await expect(page).toHaveURL(
      '/en/cv/?hide=position:vana-frontend-engineer,section:education,tech:react',
    );

    await customize.getByRole('button', { name: 'Show everything' }).click();
    for (const name of HIDDEN) await expect(part(page, name)).toBeVisible();
    await expect(page).toHaveURL('/en/cv/');
  });

  test('opens a shared link hidden before it hydrates, and prints it so', async ({
    page,
  }) => {
    // Hidden at the first chance a script could have to reveal them.
    await page.goto(`/en/cv/?hide=${HIDDEN.join(',')}`, {
      waitUntil: 'domcontentloaded',
    });
    for (const name of HIDDEN) await expect(part(page, name)).toBeHidden();

    await page.getByText('Customize', { exact: true }).click();
    await expect(
      page.getByRole('checkbox', { name: 'React' }),
    ).not.toBeChecked();

    await page.emulateMedia({ media: 'print' });
    for (const name of HIDDEN) await expect(part(page, name)).toBeHidden();
    await expect(part(page, 'section:skills')).toBeVisible();
  });

  test('leaves the ATS sheet as built, whatever the URL', async ({ page }) => {
    await page.goto('/en/cv/ats/?hide=section:summary');
    await expect(
      page.getByRole('heading', { level: 2, name: 'Summary' }),
    ).toBeVisible();
    await expect(page.locator('details.cv-customize')).toHaveCount(0);
    await expect(page.locator('#cv-hidden')).toHaveCount(0);
  });

  test("a switch to another reading drops the first reading's choices", async ({
    page,
  }) => {
    await page.goto('/en/cv/?hide=section:summary');
    await expect(part(page, 'section:summary')).toBeHidden();
    await page
      .getByRole('navigation', { name: 'Reading' })
      .locator('a[href="/en/cv/backend/"]')
      .click();
    await page.waitForURL('/en/cv/backend/');
    await expect(part(page, 'section:summary')).toBeVisible();
  });
});
