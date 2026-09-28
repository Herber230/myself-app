import { describe, expect, it } from 'vitest';

import { loadFeaturedProjects } from './projects';
import { SITE_RECORDS as CONTENT } from './repositories';
import { SITE_CONTENT } from './repositories';
import { buildSiteContent } from './site-content';

const ids = (projects: { id: unknown }[]) => projects.map(each => each.id);

describe('the featured projects', () => {
  it('are the shipped ones, in their order', async () => {
    expect(ids(await loadFeaturedProjects(SITE_CONTENT))).toEqual([
      'myself-app',
      'entifix',
    ]);
  });

  it('leave out a project that is not featured, and follow order, not file position', async () => {
    const [first, second] = structuredClone(CONTENT['projects.json']) as Record<
      string,
      unknown
    >[];
    const content = buildSiteContent({
      ...CONTENT,
      'projects.json': [
        { ...first, order: 5 },
        { ...second, order: 1 },
        { ...first, id: 'side-project', featured: false, order: 0 },
      ],
    });
    expect(ids(await loadFeaturedProjects(content))).toEqual([
      'entifix',
      'myself-app',
    ]);
  });
});
