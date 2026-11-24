import { globSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { workspaceRoot } from '@nx/devkit';
import { expect, type Locator, type Page, test } from '@playwright/test';

/**
 * The shared pages under `/for/`: reached by their link alone, kept out of
 * search, and standing apart from the site.
 */

const OUT = join(workspaceRoot, 'apps/myself-app/out');

/**
 * Looks at a ghost once the island has hydrated: until then a tap does
 * nothing, so it taps again until the ghost has settled.
 */
async function lookAt(ghost: Locator) {
  await expect
    .poll(async () => {
      if ((await ghost.getAttribute('data-state')) === 'both') {
        await ghost.click({ timeout: 1000 }).catch(() => undefined);
      }
      return ghost.getAttribute('data-state');
    })
    .not.toBe('both');
}

test('`/for/spooky/` is an English page asking its question', async ({
  page,
}) => {
  const response = await page.goto('/for/spooky/');
  expect(response?.status()).toBe(200);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Would you like to be my Spooky?',
    }),
  ).toBeVisible();
});

test('`/for/spooky` moves to its slash form, as the bucket answers', async ({
  request,
}) => {
  const response = await request.get('/for/spooky', { maxRedirects: 0 });
  expect(response.status()).toBe(301);
  expect(response.headers()['location']).toBe('/for/spooky/');
});

test('the page is kept out of search', async ({ page }) => {
  await page.goto('/for/spooky/');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex, nofollow',
  );
});

test('nothing of the site links to a shared page, nor lists it', async ({
  request,
}) => {
  const pages = globSync('**/*.html', { cwd: OUT }).filter(
    file => !file.startsWith('for/'),
  );
  expect(pages.length).toBeGreaterThan(0);
  const linking = pages.filter(file =>
    /href="[^"]*\/for\//.test(readFileSync(join(OUT, file), 'utf8')),
  );
  expect(linking).toEqual([]);
  for (const listing of ['/sitemap.xml', '/robots.txt']) {
    expect(await (await request.get(listing)).text()).not.toContain('/for/');
  }
});

test('looking at one ghost settles its twin opposite', async ({ page }) => {
  await page.goto('/for/spooky/');
  const a = page.getByRole('button', { name: 'Look at Ghost A' });
  const b = page.getByRole('button', { name: 'Look at Ghost B' });
  await lookAt(a);
  const [stateA, stateB] = await Promise.all([
    a.getAttribute('data-state'),
    b.getAttribute('data-state'),
  ]);
  expect(new Set([stateA, stateB])).toEqual(new Set(['pumpkin', 'ghost']));
  await expect(page.getByText(/^Looked 1 time\./)).toBeVisible();

  await page.getByRole('button', { name: 'Entangle them again' }).click();
  await expect(b).toHaveAttribute('data-state', 'both');
  await lookAt(b);
  await expect(page.getByText(/^Looked 2 times\./)).toBeVisible();
});

test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('the page holds still, and the demo still answers', async ({ page }) => {
    await page.goto('/for/spooky/');
    const ghost = page.locator('.spooky-hero-ghost');
    await expect(ghost).toBeVisible();
    expect(
      await ghost.evaluate(element => getComputedStyle(element).animationName),
    ).toBe('none');
    await lookAt(page.getByRole('button', { name: 'Look at Ghost A' }));
  });
});

test('the page ships none of the site’s entifix', async ({ page }) => {
  const scripts: Promise<string>[] = [];
  page.on('response', response => {
    if (response.request().resourceType() === 'script') {
      scripts.push(response.text());
    }
  });
  await page.goto('/for/spooky/');
  await lookAt(page.getByRole('button', { name: 'Look at Ghost A' }));
  const loaded = await Promise.all(scripts);
  expect(loaded.length).toBeGreaterThan(0);
  for (const script of loaded) {
    expect(script).not.toContain('EntityRepositoryTag');
  }
});

test.describe('`/for/spooky/one-month/`', () => {
  // Built for a phone first: walk it at a phone's size.
  test.use({ viewport: { width: 390, height: 844 } });

  const PATH = '/for/spooky/one-month/';
  const shown = (page: Page) =>
    page.locator('section[data-active]').getAttribute('aria-label');

  /** Where a tap goes on: the right side of the screen. */
  const tapForward = (page: Page) => page.mouse.click(320, 600);
  /** Where a tap goes back: the left side. */
  const tapBack = (page: Page) => page.mouse.click(40, 600);

  /**
   * Taps on from a card once the island has hydrated: until then a tap does
   * nothing, so it taps again until the card has changed.
   */
  async function tapOnFrom(page: Page, from: string) {
    await expect
      .poll(async () => {
        if ((await shown(page)) === from) await tapForward(page);
        return shown(page);
      })
      .not.toBe(from);
  }

  async function countEight(page: Page) {
    const drum = page.locator('.month-pad');
    for (let beat = 0; beat < 8; beat++) await drum.click({ force: true });
  }

  test('is an English page, out of search, greeting her', async ({ page }) => {
    const response = await page.goto(PATH);
    expect(response?.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Hi Spooky.' }),
    ).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow',
    );
  });

  test('moves to its slash form, as the bucket answers', async ({
    request,
  }) => {
    const response = await request.get('/for/spooky/one-month', {
      maxRedirects: 0,
    });
    expect(response.status()).toBe(301);
    expect(response.headers()['location']).toBe(PATH);
  });

  test('tells the story card by card, through the count, to its end', async ({
    page,
  }) => {
    await page.goto(PATH);
    const cards = [
      'Cover',
      'The plan',
      'Some things came up',
      'The thought',
      'The clumsy ask',
      'Yes',
      'The salsa night',
    ];
    for (const card of cards) {
      expect(await shown(page)).toBe(card);
      await tapOnFrom(page, card);
    }
    expect(await shown(page)).toBe('Count with me');

    // A tap beside the drum does not skip the count, nor does the arrow key.
    await tapForward(page);
    await page.keyboard.press('ArrowRight');
    expect(await shown(page)).toBe('Count with me');
    await expect(page.getByText('Tap the drum to count with me')).toBeVisible();

    await countEight(page);
    await expect(
      page.getByText('On 4 and 8, nobody steps: they’re pauses.'),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Continue' }).click();
    expect(await shown(page)).toBe('Closing');
    await expect(page.getByText('Happy one month, Spooky.')).toBeVisible();

    // The last card does not move on by a tap; it starts again by its button.
    await tapForward(page);
    expect(await shown(page)).toBe('Closing');
    await page.getByRole('button', { name: 'Start again' }).click();
    expect(await shown(page)).toBe('Cover');
  });

  test('goes back by a tap on the left, or the left arrow', async ({
    page,
  }) => {
    await page.goto(PATH);
    await tapOnFrom(page, 'Cover');
    await tapOnFrom(page, 'The plan');
    await tapBack(page);
    expect(await shown(page)).toBe('The plan');
    await page.keyboard.press('ArrowLeft');
    expect(await shown(page)).toBe('Cover');
    await page.keyboard.press('ArrowRight');
    expect(await shown(page)).toBe('The plan');
  });

  test('ships none of the site’s entifix', async ({ page }) => {
    const scripts: Promise<string>[] = [];
    page.on('response', response => {
      if (response.request().resourceType() === 'script') {
        scripts.push(response.text());
      }
    });
    await page.goto(PATH);
    await tapOnFrom(page, 'Cover');
    const loaded = await Promise.all(scripts);
    expect(loaded.length).toBeGreaterThan(0);
    for (const script of loaded) {
      expect(script).not.toContain('EntityRepositoryTag');
    }
  });
});
