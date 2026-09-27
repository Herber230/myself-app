/**
 * A post's Markdown, rendered as `next build` renders it: in Node, to HTML.
 */
import { join } from 'node:path';

import type { ComponentPropsWithoutRef } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { PostContentError } from './problem';
import { renderMarkdown } from './render';
import type { ResourceContext } from './resources';

// Outside Next, `Link` knows nothing of `trailingSlash`: the anchor it renders.
vi.mock('next/link', () => ({
  default: ({ href, ...props }: ComponentPropsWithoutRef<'a'>) => (
    <a href={href} {...props} />
  ),
}));

const CONTEXT: ResourceContext = {
  source: 'posts/entifix-in-the-browser.en.md',
  post: 'entifix-in-the-browser',
  locale: 'es',
  sitePaths: new Set(['/', '/tech-radar', '/tech-radar/nx']),
  publicDirectory: join(process.cwd(), 'public'),
};

const html = async (markdown: string, context: Partial<ResourceContext> = {}) =>
  renderToStaticMarkup(
    <>{await renderMarkdown(markdown, { ...CONTEXT, ...context })}</>,
  );

// Shiki loads its grammars and themes once, on the first render: seconds.
beforeAll(async () => {
  await html('```ts\nconst warm = true;\n```');
}, 60_000);

const failure = async (markdown: string) => {
  try {
    await html(markdown);
  } catch (error) {
    expect(error).toBeInstanceOf(PostContentError);
    return (error as Error).message;
  }
  throw new Error('rendered, where it should have stopped');
};

describe('the paragraph types', () => {
  it('render each callout, the lead and an aside with its class', async () => {
    const out = await html(
      [
        ':::lead\nFirst.\n:::',
        ':::note\nN.\n:::',
        ':::tip\nT.\n:::',
        ':::warning\nW.\n:::',
        ':::aside\nA.\n:::',
      ].join('\n\n'),
    );
    expect(out).toContain('<div class="post-lead"><p>First.</p></div>');
    expect(out).toContain(
      '<aside class="post-callout post-callout-note" role="note"><p>N.</p></aside>',
    );
    expect(out).toContain('post-callout post-callout-tip');
    expect(out).toContain('post-callout post-callout-warning');
    expect(out).toContain('<aside class="post-aside"><p>A.</p></aside>');
  });

  it('render a figure: the image, sized, then its caption', async () => {
    const out = await html(
      '::figure[The flow]{src="./diagram.svg" alt="A page and a filter"}',
    );
    expect(out).toContain('<figure class="post-figure">');
    expect(out).toContain(
      '<img src="/blog/entifix-in-the-browser/diagram.svg" alt="A page and a filter" width="640" height="240" decoding="async"/>',
    );
    expect(out).toContain('<figcaption>The flow</figcaption>');
  });

  it('render a figure with no caption as the image alone', async () => {
    const out = await html('::figure{src="./diagram.svg" alt="A diagram"}');
    expect(out).not.toContain('figcaption');
  });

  it('stop the build on a figure with no image, or an unknown directive', async () => {
    expect(await failure('::figure[Nothing]')).toBe(
      'posts/entifix-in-the-browser.en.md:1 a figure needs a src',
    );
    expect(await failure('Intro.\n\n:::warnign\nW.\n:::')).toBe(
      'posts/entifix-in-the-browser.en.md:3 holds an unknown directive "warnign"',
    );
    expect(await failure('Text with a :sparkle directive.')).toContain(
      'unknown directive "sparkle"',
    );
  });
});

describe('images', () => {
  it('load lazily after the first', async () => {
    const out = await html('![One](./diagram.svg)\n\n![Two](./diagram.svg)');
    expect(out.match(/loading="lazy"/g)).toHaveLength(1);
    expect(out.indexOf('loading="lazy"')).toBeGreaterThan(
      out.indexOf('alt="One"'),
    );
  });

  it('stop the build when outside the post, without alt text, or missing', async () => {
    expect(await failure('![A](https://example.com/a.png)')).toContain(
      'images live beside the post',
    );
    expect(await failure('![](./diagram.svg)')).toContain(
      'an image without alt text',
    );
    expect(await failure('![Gone](./gone.png)')).toContain(
      'an image that does not exist: public/blog/entifix-in-the-browser/gone.png',
    );
  });
});

describe('links', () => {
  it('take the reader’s locale within the site, and keep an anchor', async () => {
    const out = await html(
      '[Radar](/tech-radar/) [Nx](/tech-radar/nx/#history) [Home](/) [Up](#top)',
    );
    expect(out).toContain('href="/es/tech-radar/"');
    expect(out).toContain('href="/es/tech-radar/nx/#history"');
    expect(out).toContain('href="/es/"');
    expect(out).toContain('href="#top"');
  });

  it('open an external page with no access to this one', async () => {
    const out = await html(
      '[entifix](https://github.com/r10c-technologies/entifix)',
    );
    expect(out).toContain(
      '<a href="https://github.com/r10c-technologies/entifix" rel="noopener noreferrer">',
    );
  });

  it('stop the build on a relative link, a missing slash, or an unknown page', async () => {
    expect(await failure('[x](other/)')).toContain('starts with /');
    expect(await failure('[x](/tech-radar)')).toContain(
      'needs its trailing slash',
    );
    expect(await failure('[x](/nowhere/)')).toContain(
      'a page the site does not have',
    );
  });
});

describe('what the body may hold', () => {
  it('drops raw HTML and scripts, and anchors every heading', async () => {
    const out = await html(
      '## A heading\n\n<script>alert(1)</script>\n\n<b onclick="x()">bold</b>',
    );
    expect(out).toContain('<h2 id="a-heading">A heading</h2>');
    expect(out).not.toContain('<script');
    expect(out).not.toContain('onclick');
  });

  it('highlights code in both themes at build, and keeps tables', async () => {
    const out = await html(
      '```ts\nconst page = 1;\n```\n\n| a | b |\n| - | - |\n| 1 | 2 |',
    );
    expect(out).toContain('class="shiki');
    expect(out).toContain('--shiki-dark');
    expect(out).toContain('<table>');
  });

  it('renders a post as it ships, in both locales', async () => {
    const { readPostBodyFile } = await import('../../content/post-bodies');
    for (const locale of ['en', 'es'] as const) {
      const body = readPostBodyFile('entifix-in-the-browser', locale) as string;
      const sitePaths = new Set([...CONTEXT.sitePaths]);
      const out = await html(body, { locale, sitePaths });
      expect(out).toContain('post-lead');
      expect(out).toContain(`href="/${locale}/tech-radar/"`);
    }
  });
});
