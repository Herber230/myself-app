import { expect, type Locator, type Page, test } from '@playwright/test';

/**
 * The design system on the export (#16): the site's palettes, applied before
 * the first paint, switchable, and the primitives styled by the stylesheet.
 */

const STORAGE_KEY = 'myself-app-theme';

/** `--color-surface` of each palette in `app/themes.css`, as computed. */
const SURFACE = {
  blue: 'rgb(11, 29, 58)',
  light: 'rgb(247, 246, 243)',
  dark: 'rgb(18, 19, 20)',
};

/**
 * Every value `data-theme` takes while the page loads, from before its first
 * script runs. A palette flash is a value here that differs from the last one.
 *
 * Built from each record's `oldValue` plus the value at the end: writes made in
 * one task are delivered together, so reading the attribute in the callback
 * would only ever see the last of them.
 */
async function recordThemeChanges(page: Page) {
  await page.addInitScript(() => {
    const previous: (string | null)[] = [];
    (window as unknown as { __themes: typeof previous }).__themes = previous;
    // On `document`, not `document.documentElement`: this runs before the
    // parser has created the <html> the page will keep.
    new MutationObserver(records => {
      for (const record of records) {
        if (record.target === document.documentElement) {
          previous.push(record.oldValue);
        }
      }
    }).observe(document, {
      attributes: true,
      attributeFilter: ['data-theme'],
      attributeOldValue: true,
      subtree: true,
    });
  });
}

/** The themes the page was set to, in order, ending with the current one. */
async function themeChanges(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const previous = (window as unknown as { __themes: (string | null)[] })
      .__themes;
    // The first write replaces "no theme yet", which is not a palette.
    return [
      ...previous.slice(1),
      document.documentElement.getAttribute('data-theme'),
    ].filter((theme): theme is string => theme !== null);
  });
}

/**
 * One entry of the theme menu, found by the menu's name and the theme's label.
 * The menu renders on the client only, so this waits for hydration. The entry
 * need not be shown to be read: the landing page's bar is hidden until it
 * scrolls.
 */
async function themeOption(
  page: Page,
  menu: string,
  theme: string,
): Promise<Locator> {
  const trigger = page.getByRole('banner').getByLabel(menu, { exact: true });
  await trigger.waitFor({ state: 'attached' });
  return trigger
    .locator('xpath=..')
    .getByRole('button', { name: theme, exact: true, includeHidden: true });
}

/** Opens the theme menu and picks a theme from it. */
async function chooseTheme(page: Page, theme: string) {
  const trigger = page.getByRole('banner').getByLabel('Theme', { exact: true });
  await trigger.click();
  await (await themeOption(page, 'Theme', theme)).click();
}

async function expectPainted(page: Page, theme: keyof typeof SURFACE) {
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
  await expect(page.locator('body')).toHaveCSS(
    'background-color',
    SURFACE[theme],
  );
}

for (const scheme of ['light', 'dark'] as const) {
  test(`a first visit paints blue under the system's ${scheme} scheme`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await recordThemeChanges(page);
    await page.goto('/en/');

    // The site's own blue, whatever the system says (ADR 0011).
    await expectPainted(page, 'blue');
    // Hydrated: the theme menu renders on the client only.
    await expect(await themeOption(page, 'Theme', 'Blue')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    const changes = await themeChanges(page);
    expect(changes.length).toBeGreaterThan(0);
    expect(changes.every(theme => theme === 'blue')).toBe(true);
    expect(
      await page.evaluate(key => localStorage.getItem(key), STORAGE_KEY),
    ).toBe('blue');
  });
}

test('a stored theme wins over the system and never flashes', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.addInitScript(
    key => localStorage.setItem(key, 'dark'),
    STORAGE_KEY,
  );
  await recordThemeChanges(page);
  await page.goto('/es/cv/');

  await expectPainted(page, 'dark');
  // Labels from the site's catalogs, in the page's locale.
  await expect(await themeOption(page, 'Tema', 'Oscuro')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  const changes = await themeChanges(page);
  expect(changes.length).toBeGreaterThan(0);
  expect(changes.every(theme => theme === 'dark')).toBe(true);
});

test('the switcher changes the theme, and it survives a reload', async ({
  page,
}) => {
  // Not the landing page, whose bar is hidden until it scrolls.
  await page.goto('/en/cv/');
  await expectPainted(page, 'blue');

  await chooseTheme(page, 'Light');
  await expectPainted(page, 'light');
  await chooseTheme(page, 'Dark');
  await expectPainted(page, 'dark');

  await page.reload();
  await expectPainted(page, 'dark');
  await expect(await themeOption(page, 'Theme', 'Dark')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

for (const theme of ['blue', 'dark'] as const) {
  test(`paper is light while the screen is ${theme}`, async ({ page }) => {
    await page.addInitScript(
      ([key, value]) => localStorage.setItem(key, value),
      [STORAGE_KEY, theme] as const,
    );
    await page.goto('/en/cv/');
    await expectPainted(page, theme);

    // The prebuilt PDFs print from a fresh context, which paints blue. In
    // print the page is the sheet: white, with the light palette's ink.
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('body')).toHaveCSS(
      'background-color',
      'rgb(255, 255, 255)',
    );
    await expect(page.locator('.cv-name')).toHaveCSS(
      'color',
      'rgb(29, 31, 34)',
    );
  });
}

test('the primitives are styled and the fonts are self-hosted', async ({
  page,
}) => {
  const fonts: string[] = [];
  page.on('response', response => {
    if (response.url().endsWith('.woff2') && response.ok()) {
      fonts.push(response.url());
    }
  });
  await page.goto('/en/');

  // `Stack` spaces its children with a token. Without the `@source` for the
  // primitives' `dist`, its class produces no CSS and the gap stays `normal`.
  const heading = page.getByRole('heading', { level: 1 });
  const gap = await heading.evaluate(
    element => getComputedStyle(element.parentElement as Element).rowGap,
  );
  expect(gap).not.toBe('normal');

  await page.evaluate(() => document.fonts.ready);
  expect(fonts.length).toBeGreaterThan(0);
  for (const url of fonts) {
    expect(new URL(url).origin).toBe(new URL(page.url()).origin);
  }
});
