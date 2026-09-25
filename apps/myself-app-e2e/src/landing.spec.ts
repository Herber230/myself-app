import { expect, type Page, test } from '@playwright/test';

/**
 * The landing page (#29, ADR 0008 and 0011): the hero from `Profile`, a bar
 * revealed by scroll, anchors that work without scripting, and motion that
 * stops under reduced motion. Below it, the sections from content (#30–#32).
 */

const HERO = {
  en: {
    title: 'Software Engineer',
    cv: 'Read my CV',
    radar: 'Explore my tech radar',
  },
  es: {
    title: 'Ingeniero de software',
    cv: 'Ver mi CV',
    radar: 'Explorar mi radar tecnológico',
  },
};

/** The bar's opacity, as painted. */
const barOpacity = (page: Page) =>
  page
    .getByRole('banner')
    .evaluate(element => Number(getComputedStyle(element).opacity));

for (const [locale, copy] of Object.entries(HERO)) {
  test(`/${locale}/ opens on the hero, from the profile`, async ({ page }) => {
    await page.goto(`/${locale}/`);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Herber Colop' }),
    ).toBeVisible();
    await expect(page.getByText(copy.title, { exact: true })).toBeVisible();

    const main = page.getByRole('main');
    await expect(main.getByRole('link', { name: copy.cv })).toHaveAttribute(
      'href',
      `/${locale}/cv/`,
    );
    await expect(main.getByRole('link', { name: copy.radar })).toHaveAttribute(
      'href',
      `/${locale}/tech-radar/`,
    );
  });
}

test("a project's technology opens its entry on the radar", async ({
  page,
}) => {
  await page.goto('/en/');
  const projects = page.getByRole('region', { name: 'Projects' });
  const link = projects.getByRole('link', { name: 'TypeScript' }).first();
  await expect(link).toHaveAttribute('href', '/en/tech-radar/#tech-typescript');
  await link.click();
  await page.waitForURL('/en/tech-radar/#tech-typescript');
  await expect(page.locator('#tech-typescript')).toBeInViewport();
});

test('the bar is hidden over the hero and revealed by scrolling', async ({
  page,
}) => {
  await page.goto('/en/');
  expect(await barOpacity(page)).toBe(0);

  await page.mouse.wheel(0, 2000);
  await expect.poll(() => barOpacity(page)).toBe(1);
  await expect(page.getByRole('banner')).toHaveCSS('position', 'fixed');
});

test('a dropdown closes on Escape and on a click elsewhere', async ({
  page,
}) => {
  await page.goto('/en/cv/');
  const trigger = page.getByRole('banner').getByLabel('Theme', { exact: true });
  const menu = trigger.locator('xpath=..');
  await trigger.click();
  await expect(menu).toHaveAttribute('open');
  await page.keyboard.press('Escape');
  await expect(menu).not.toHaveAttribute('open');
  await expect(trigger).toBeFocused();

  await trigger.click();
  await page.getByRole('heading', { level: 1 }).click();
  await expect(menu).not.toHaveAttribute('open');
});

test('a focused link in the hidden bar is shown', async ({ page }) => {
  await page.goto('/en/');
  await page.getByRole('banner').getByRole('link', { name: 'About' }).focus();
  await expect.poll(() => barOpacity(page)).toBe(1);
});

test('the section in view is marked, and the language switch keeps it', async ({
  page,
}) => {
  await page.goto('/en/');
  const nav = page.getByRole('navigation', { name: 'Sections' });
  await page.locator('#projects').scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 1);
  await expect(nav.getByRole('link', { name: 'Projects' })).toHaveAttribute(
    'aria-current',
    'location',
  );
  await expect(nav.getByRole('link', { name: 'About' })).not.toHaveAttribute(
    'aria-current',
  );

  const banner = page.getByRole('banner');
  await banner.getByLabel('Language', { exact: true }).click();
  await banner.getByRole('link', { name: 'Español' }).click();
  await page.waitForURL('/es/#projects');
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('the links move into a menu, which a followed link closes', async ({
    page,
  }) => {
    await page.goto('/en/cv/');
    const banner = page.getByRole('banner');
    // One navigation at a time: the inline list is not shown on a phone.
    await expect(banner.getByRole('navigation')).toHaveCount(0);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(375);

    const trigger = banner.getByLabel('Menu', { exact: true });
    await trigger.click();
    const menu = banner.getByRole('navigation', { name: 'Sections' });
    await expect(menu.getByRole('link')).toHaveCount(6);

    await menu.getByRole('link', { name: 'Contact' }).click();
    await page.waitForURL('/en/#contact');
    await expect(trigger.locator('xpath=..')).not.toHaveAttribute('open');
  });
});

test.describe('with scripting off', () => {
  test.use({ javaScriptEnabled: false });

  test('the hero is readable and the anchors still move', async ({ page }) => {
    await page.goto('/en/');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Herber Colop' }),
    ).toBeVisible();

    await page.getByRole('link', { name: 'Scroll to read more' }).click();
    await page.waitForURL('/en/#about');
    await expect(
      page.getByRole('heading', { level: 2, name: 'About me' }),
    ).toBeInViewport();
  });

  test('the sections are all there, their links plain links', async ({
    page,
  }) => {
    await page.goto('/en/#contact');
    const contact = page.getByRole('region', { name: 'Contact' });
    await expect(
      contact.getByRole('link', { name: 'GitHub: Herber230' }),
    ).toHaveAttribute('href', 'https://github.com/Herber230');
    await expect(
      page
        .getByRole('region', { name: 'Projects' })
        .getByRole('heading', { level: 3 }),
    ).toHaveText(['myself-app', 'entifix']);
  });

  test('the language menu is a menu of plain links', async ({ page }) => {
    // Without scripting, Playwright never finds the panel's entrance
    // animation stable enough to click through; a browser has no such issue.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/en/cv/');
    const banner = page.getByRole('banner');
    await banner.getByLabel('Language', { exact: true }).click();
    await banner.getByRole('link', { name: 'Español' }).click();
    await page.waitForURL('/es/cv/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  });
});

test.describe('under reduced motion', () => {
  test('nothing animates, and the bar is simply shown', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/en/');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Herber Colop' }),
    ).toBeVisible();
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
    expect(await barOpacity(page)).toBe(1);
  });
});
