import { describe, expect, it } from 'vitest';

import { SITE_CONTENT } from './repositories';
import { loadSitePaths } from './site-paths';

describe('the site’s paths', () => {
  it('are the fixed pages, then each CV variant, technology and post', async () => {
    const paths = await loadSitePaths(SITE_CONTENT);
    expect(paths.slice(0, 4)).toEqual(['/', '/cv', '/tech-radar', '/blog']);
    expect(paths).toContain('/blog/a-static-site-on-s3');
    // A draft is served by `next dev` only.
    expect(paths).not.toContain('/blog/effect-four');
    expect(paths).toContain('/cv/frontend');
    expect(paths).toContain('/tech-radar/nx');
    expect(new Set(paths).size).toBe(paths.length);
  });
});
