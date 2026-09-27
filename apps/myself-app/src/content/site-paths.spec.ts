import { describe, expect, it } from 'vitest';

import { SITE_REPOSITORIES } from './repositories';
import { loadSitePaths } from './site-paths';

describe('the site’s paths', () => {
  it('are the fixed pages, then each CV variant and technology', async () => {
    const paths = await loadSitePaths(SITE_REPOSITORIES);
    expect(paths.slice(0, 3)).toEqual(['/', '/cv', '/tech-radar']);
    expect(paths).toContain('/cv/frontend');
    expect(paths).toContain('/tech-radar/nx');
    expect(new Set(paths).size).toBe(paths.length);
  });
});
