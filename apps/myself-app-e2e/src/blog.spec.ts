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
  await expect(shownPosts(page)).toHaveCount(7);
  // No control that could not work: the filter is links, until hydrated.
  await expect(page.getByRole('searchbox')).toHaveCount(0);
  await expect(page.locator('[aria-pressed]')).toHaveCount(0);
  await page.getByRole('link', { name: 'Fiction' }).click();
  await expect(page).toHaveURL(/\/en\/blog\/\?tag=fiction$/);
  await context.close();
});

test('the filter keeps its choices in the URL, through reload and history', async ({
  page,
}) => {
  await page.goto('/en/blog/');
  await page.getByRole('button', { name: 'Fiction' }).click();
  await expect(page).toHaveURL(/\/en\/blog\/\?tag=fiction$/);
  await expect(shownPosts(page)).toHaveCount(1);
  await expect(shownPosts(page).first()).toHaveAttribute(
    'data-post',
    'then-i-saw-you-dance',
  );

  await page.reload();
  await expect(shownPosts(page)).toHaveCount(1);
  await expect(
    page.getByRole('button', { name: 'Fiction', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  // What is in force, counted on the card, each a chip that removes it.
  await expect(page.getByText('1 active')).toBeVisible();
  await page.getByRole('button', { name: 'Remove Tag: Fiction' }).click();
  await expect(page).toHaveURL(/\/en\/blog\/$/);
  await page.getByRole('button', { name: 'React', exact: true }).click();
  await page.getByRole('button', { name: '2021' }).click();
  await expect(page).toHaveURL(/\?tech=react&year=2021$/);
  await expect(shownPosts(page)).toHaveCount(1);

  await page.getByRole('searchbox').fill('nothing like it');
  await expect(page.getByText('No post matches this filter.')).toBeVisible();

  await page.getByRole('button', { name: 'Show every post' }).click();
  await expect(page).toHaveURL(/\/en\/blog\/$/);
  await expect(shownPosts(page)).toHaveCount(7);
});

test('a filtered link from another page opens filtered', async ({ page }) => {
  await page.goto('/es/blog/rxjs-exceptions-react-hooks/');
  await page
    .locator('.blog-article-header')
    .getByRole('link', { name: 'Arquitectura' })
    .click();
  await expect(page).toHaveURL(/\/es\/blog\/\?tag=architecture$/);
  await expect(shownPosts(page)).toHaveCount(2);
  await expect(page.getByText('Mostrando 2 de 7')).toBeVisible();
});

// The paragraph types, figures and internal links a post can hold are the
// placeholders' (#70), drafts until written: the Markdown's own specs hold
// those, and this a published post as the export writes it.
test('a post renders its Markdown: headings, links and highlighted code', async ({
  page,
}) => {
  await page.goto('/es/blog/rxjs-exceptions-react-hooks/');
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Manejar excepciones con Rxjs y hooks de React',
    }),
  ).toBeVisible();
  const body = page.locator('.post-body');
  await expect(
    page.getByRole('heading', { level: 2, name: 'Calentando motores' }),
  ).toHaveAttribute('id', 'calentando-motores');
  await expect(body.getByRole('link', { name: 'Rxjs' })).toHaveAttribute(
    'rel',
    'noopener noreferrer',
  );
  await expect(body.locator('pre.shiki').first()).toBeVisible();
  await expect(
    page
      .getByRole('heading', { name: 'Entradas relacionadas' })
      .locator('xpath=following-sibling::ol//article'),
  ).toHaveCount(1);
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
  for (const draft of ['effect-four', 'a-static-site-on-s3'])
    expect((await request.get(`/en/blog/${draft}/`)).status()).toBe(404);
  const posts = (await (await request.get('/data/post.json')).json()) as {
    id: string;
    body?: unknown;
  }[];
  expect(posts.map(post => post.id)).not.toContain('effect-four');
  expect(posts.every(post => post.body === undefined)).toBe(true);
});
