import { join } from 'node:path';

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { renderPostBody } from './post-body.js';

const PUBLIC = join(
  import.meta.dirname,
  '../../../../../apps/myself-app/public',
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
  });
});
