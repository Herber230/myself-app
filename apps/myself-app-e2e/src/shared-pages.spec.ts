import { globSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { workspaceRoot } from '@nx/devkit';
import { expect, type Locator, test } from '@playwright/test';

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
