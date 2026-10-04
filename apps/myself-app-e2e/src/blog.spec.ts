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
  await expect(shownPosts(page)).toHaveCount(10);
  // No control that could not work: the filter is links, until hydrated.
  await expect(page.getByRole('searchbox')).toHaveCount(0);
  await expect(page.locator('[aria-pressed]')).toHaveCount(0);
  await page.getByRole('link', { name: 'Testing' }).click();
  await expect(page).toHaveURL(/\/en\/blog\/\?tag=testing$/);
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
  await expect(
    page.getByRole('button', { name: 'Testing', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  // What is in force, counted on the card, each a chip that removes it.
  await expect(page.getByText('1 active')).toBeVisible();
  await page.getByRole('button', { name: 'Remove Tag: Testing' }).click();
  await expect(page).toHaveURL(/\/en\/blog\/$/);
  await page.getByRole('button', { name: 'Amazon CloudFront' }).click();
  await page.getByRole('button', { name: '2026' }).click();
  await expect(page).toHaveURL(/\?tech=cloudfront&year=2026$/);
  await expect(shownPosts(page)).toHaveCount(1);

  await page.getByRole('searchbox').fill('nothing like it');
  await expect(page.getByText('No post matches this filter.')).toBeVisible();

  await page.getByRole('button', { name: 'Show every post' }).click();
  await expect(page).toHaveURL(/\/en\/blog\/$/);
  await expect(shownPosts(page)).toHaveCount(10);
});

test('a filtered link from another page opens filtered', async ({ page }) => {
  await page.goto('/es/blog/a-static-site-on-s3/');
  await page.getByRole('link', { name: 'Infraestructura' }).click();
  await expect(page).toHaveURL(/\/es\/blog\/\?tag=infrastructure$/);
  await expect(shownPosts(page)).toHaveCount(1);
  await expect(page.getByText('Mostrando 1 de 10')).toBeVisible();
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
  ).toHaveCount(3);
});

test('the blog’s sidebar is its filter, a post’s its table of contents, and it folds', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/en/blog/');
  const filter = page.getByRole('complementary', { name: 'Filter the posts' });
  await expect(filter.getByRole('searchbox')).toBeVisible();

  await page.goto('/en/blog/rxjs-exceptions-react-hooks/');
  const sidebar = page.getByRole('complementary', { name: 'On this page' });
  const outline = sidebar.getByRole('navigation', { name: 'On this page' });
  await expect(outline).toBeVisible();
  const article = page.locator('.blog-article');
  const open = await article.boundingBox();

  // Its first section, followed: the outline marks it.
  const first = outline.getByRole('link').first();
  await first.click();
  await expect(first).toHaveAttribute('aria-current', 'location');

  // Folded, the toggle is its icon; its name is for a reader alone.
  const toggle = sidebar.locator('summary');
  await expect(toggle).toHaveAccessibleName('Hide contents');
  await toggle.click();
  await expect(outline).toBeHidden();
  await expect
    .poll(async () => (await article.boundingBox())?.x)
    .toBeLessThan(open?.x ?? 0);
  await expect(toggle).toHaveAccessibleName('Show contents');
  await toggle.click();
  await expect(outline).toBeVisible();
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('a post opens on its title, its contents folded a tap away', async ({
    page,
  }) => {
    await page.goto('/en/blog/rxjs-exceptions-react-hooks/');
    const outline = page.getByRole('navigation', { name: 'On this page' });
    await expect(outline).toBeHidden();
    await page.getByRole('complementary').locator('summary').click();
    await expect(outline).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(390);
  });
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
