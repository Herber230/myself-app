import { describe, expect, it } from 'vitest';

import { BLOG_PREVIEWS, BLOG_READS, SHOW_DRAFTS } from './blog-reads';

describe('how the site reads its blog', () => {
  it('leaves drafts out everywhere but next dev', () => {
    expect(SHOW_DRAFTS).toBe(false);
    expect(BLOG_READS).toEqual({ includeDrafts: false });
  });

  it('opens each preview with the Markdown renderer’s excerpt', () => {
    expect(BLOG_PREVIEWS.includeDrafts).toBe(false);
    expect(BLOG_PREVIEWS.excerptOf('Some **prose** here.')).toBe(
      'Some prose here.',
    );
  });
});
