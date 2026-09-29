import { CONTENT } from '@myself-app/content';
import { describe, expect, it } from 'vitest';

import { siteContent } from './site.js';

describe('the site content', () => {
  it('serves every file of the content package, bodies attached', () => {
    const content = siteContent();
    expect(Object.keys(content.records).sort()).toEqual(
      Object.keys(CONTENT).sort(),
    );
    const [post] = content.records['posts.json'] as { body: unknown }[];
    expect(post?.body).toMatchObject({ en: expect.any(String) });
  });
});
