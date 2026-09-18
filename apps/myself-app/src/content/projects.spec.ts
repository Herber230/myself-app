import { CONTENT } from '@myself-app/content';
import { describe, expect, it } from 'vitest';

import { loadFeaturedProjects } from './projects';
import { SITE_REPOSITORIES } from './repositories';
import { buildSiteRepositories } from './site-content';

const ids = (projects: { id: unknown }[]) => projects.map(each => each.id);

describe('the featured projects', () => {
  it('are the shipped ones, in their order', async () => {
    expect(ids(await loadFeaturedProjects(SITE_REPOSITORIES))).toEqual([
      'myself-app',
      'entifix',
    ]);
  });

  it('leave out a project that is not featured, and follow order, not file position', async () => {
    const [first, second] = structuredClone(CONTENT['projects.json']) as Record<
      string,
      unknown
    >[];
    const repositories = buildSiteRepositories({
      ...CONTENT,
      'projects.json': [
        { ...first, order: 5 },
        { ...second, order: 1 },
        { ...first, id: 'side-project', featured: false, order: 0 },
      ],
    });
    expect(ids(await loadFeaturedProjects(repositories))).toEqual([
      'entifix',
      'myself-app',
    ]);
  });
});
