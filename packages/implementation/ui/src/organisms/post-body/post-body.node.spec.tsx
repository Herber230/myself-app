import { join } from 'node:path';

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { renderMarkdownBody, renderPostBody } from './post-body.js';

const PUBLIC = join(
  import.meta.dirname,
  '../../../../../../apps/myself-app/public',
);

describe("a post's body", () => {
  it('renders its Markdown, with the callouts named in its language', async () => {
    const body = await renderPostBody({
      id: 'a-post',
      markdown: 'See [the radar](/tech-radar/).\n\n:::note\nRead this.\n:::',
      locale: 'es',
      sitePaths: ['/tech-radar'],
      publicDirectory: PUBLIC,
    });
    const html = renderToStaticMarkup(<>{body}</>);
    expect(html).toContain('class="post-body"');
    expect(html).toContain('--post-note-label:&quot;Nota&quot;');
    // Outside Next, `Link` knows nothing of `trailingSlash`.
    expect(html).toContain('href="/es/tech-radar"');
    expect(html).toContain('Read this.');
    // Shiki loads its grammars and themes on the first render: seconds.
  }, 30_000);
});

describe('other Markdown beside the records', () => {
  it('is rendered as a post is, and named by its own file in a problem', async () => {
    const input = {
      id: 'myself-app-0001',
      locale: 'en' as const,
      sitePaths: ['/projects/myself-app/adr/0002'],
      publicDirectory: PUBLIC,
    };
    const body = await renderMarkdownBody({
      ...input,
      source: 'adrs/myself-app-0001.md',
      markdown: 'See [ADR 0002](/projects/myself-app/adr/0002/).',
    });
    expect(renderToStaticMarkup(<>{body}</>)).toContain(
      'href="/en/projects/myself-app/adr/0002"',
    );
    await expect(
      renderMarkdownBody({
        ...input,
        source: 'adrs/myself-app-0001.md',
        markdown: 'See [nothing](/nowhere/).',
      }),
    ).rejects.toThrow('adrs/myself-app-0001.md');
  }, 30_000);
});
