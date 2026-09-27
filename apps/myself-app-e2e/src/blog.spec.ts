import { expect, type Page, test } from '@playwright/test';

/**
 * The blog as the export writes it (ADR 0016, 0017): a home whose filter runs
 * entifix's use case in the browser over `/data/post.json`, and posts
 * rendered from Markdown at build.
 */

const shownPosts = (page: Page) => page.locator('article[data-post]');

test('the blog lists every post, and needs no JavaScript to', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/en/blog/');
  await expect(shownPosts(page)).toHaveCount(3);
  // No control that could not work.
  await expect(page.getByRole('group', { name: 'Tag' })).toHaveCount(0);
  await context.close();
});

test('the filter keeps its choices in the URL, through reload and history', async ({
  page,
}) => {
  await page.goto('/en/blog/');
  await page.getByRole('button', { name: 'Testing' }).click();
  await expect(page).toHaveURL(/\/en\/blog\/\?tag=testing$/);
  await expect(shownPosts(page)).toHaveCount(1);
  await expect(shownPosts(page).first()).toHaveAttribute(
    'data-post',
    'coverage-at-one-hundred',
  );

  await page.reload();
  await expect(shownPosts(page)).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Testing' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );

  await page.getByRole('button', { name: 'Testing' }).click();
  await page.getByRole('button', { name: 'Amazon CloudFront' }).click();
  await page.getByRole('button', { name: '2026' }).click();
  await expect(page).toHaveURL(/\?tech=cloudfront&year=2026$/);
  await expect(shownPosts(page)).toHaveCount(1);

  await page.getByRole('searchbox').fill('nothing like it');
  await expect(page.getByText('No post matches this filter.')).toBeVisible();

  await page.getByRole('button', { name: 'Show every post' }).click();
  await expect(page).toHaveURL(/\/en\/blog\/$/);
  await expect(shownPosts(page)).toHaveCount(3);
});

test('a filtered link from another page opens filtered', async ({ page }) => {
  await page.goto('/es/blog/a-static-site-on-s3/');
  await page.getByRole('link', { name: 'Infraestructura' }).click();
  await expect(page).toHaveURL(/\/es\/blog\/\?tag=infrastructure$/);
  await expect(shownPosts(page)).toHaveCount(1);
  await expect(page.getByText('Mostrando 1 de 3')).toBeVisible();
});

test('a post renders its Markdown: paragraph types, a figure, links and code', async ({
  page,
}) => {
  await page.goto('/es/blog/entifix-in-the-browser/');
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Un caso de uso, dos repositorios: entifix en el navegador',
    }),
  ).toBeVisible();
  const body = page.locator('.post-body');
  await expect(body.locator('.post-lead')).toBeVisible();
  await expect(body.getByRole('note')).toHaveCount(3);
  await expect(
    page.getByRole('heading', { level: 2, name: 'Tipos de párrafo' }),
  ).toHaveAttribute('id', 'tipos-de-párrafo');

  const figure = body.locator('figure img');
  await expect(figure).toHaveAttribute('width', '640');
  await figure.scrollIntoViewIfNeeded();
  await expect
    .poll(() => figure.evaluate(img => (img as HTMLImageElement).naturalWidth))
    .toBeGreaterThan(0);

  await expect(body.getByRole('link', { name: 'el radar' })).toHaveAttribute(
    'href',
    '/es/tech-radar/',
  );
  await expect(
    body.getByRole('link', { name: 'entifix en GitHub' }),
  ).toHaveAttribute('rel', 'noopener noreferrer');
  await expect(body.locator('pre.shiki')).toBeVisible();

  await expect(
    page
      .getByRole('heading', { name: 'Entradas relacionadas' })
      .locator('xpath=following-sibling::ol//article'),
  ).toHaveCount(1);
});

test('each locale has a feed, and no draft is exported', async ({
  request,
}) => {
  for (const locale of ['en', 'es']) {
    const feed = await request.get(`/${locale}/blog/rss.xml`);
    expect(feed.status()).toBe(200);
    expect(await feed.text()).toContain('<rss version="2.0">');
  }
  expect((await request.get('/en/blog/effect-four/')).status()).toBe(404);
  const posts = (await (await request.get('/data/post.json')).json()) as {
    id: string;
    body?: unknown;
  }[];
  expect(posts.map(post => post.id)).not.toContain('effect-four');
  expect(posts.every(post => post.body === undefined)).toBe(true);
});
