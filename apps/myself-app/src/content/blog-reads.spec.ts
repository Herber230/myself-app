import { describe, expect, it } from 'vitest';

import { BLOG_READS, SHOW_DRAFTS } from './blog-reads';

describe('how the site reads its blog', () => {
  it('leaves drafts out everywhere but next dev', () => {
    expect(SHOW_DRAFTS).toBe(false);
    expect(BLOG_READS).toEqual({ includeDrafts: false });
  });
});
