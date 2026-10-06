/**
 * Under `next dev` a draft has its page, marked as one (ADR 0017). Whether
 * drafts are read is fixed when the blog's module loads, so this loads it
 * again with `NODE_ENV` as `next dev` sets it.
 */
import { within } from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { paramsOf, renderPage } from '../../../../test/render';

type Page = typeof import('./page');

let page: Page;

beforeAll(async () => {
  vi.stubEnv('NODE_ENV', 'development');
  vi.resetModules();
  page = await import('./page');
}, 60_000);

afterAll(() => {
  vi.unstubAllEnvs();
});

describe('a draft, under next dev', () => {
  it('has a page, marked as a draft', async () => {
    expect(await page.generateStaticParams()).toContainEqual({
      slug: 'effect-four',
    });
    const props = paramsOf({ locale: 'en', slug: 'effect-four' }) as Parameters<
      Page['default']
    >[0];
    await renderPage(page.default(props), 'en');
    const header = document.querySelector(
      '.blog-article-header',
    ) as HTMLElement;
    expect(within(header).getByText('Draft').className).toBe('post-card-draft');
    // A fresh module graph loads Shiki again: seconds.
  }, 60_000);

  it('carries the time it was updated, for a post updated since', async () => {
    const metadata = await page.generateMetadata(
      paramsOf({ locale: 'en', slug: 'a-static-site-on-s3' }) as Parameters<
        Page['generateMetadata']
      >[0],
    );
    expect(metadata.openGraph).toMatchObject({
      publishedTime: '2026-06-12T00:00:00.000Z',
      modifiedTime: '2026-09-20T00:00:00.000Z',
    });
  });
});
