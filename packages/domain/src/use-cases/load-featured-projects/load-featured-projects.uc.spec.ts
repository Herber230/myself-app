import { describe, expect, it } from 'vitest';

import { fixtureContent } from '../content.fixture.js';
import { loadFeaturedProjects } from './load-featured-projects.uc.js';

describe('the featured projects', () => {
  it('leave out a project not featured, and follow order, not file position', async () => {
    const featured = await loadFeaturedProjects(fixtureContent());
    expect(featured.map(each => each.project.id)).toEqual([
      'library',
      'engine',
    ]);
  });

  it('carry their technologies, in the order each project lists them', async () => {
    const [, engine] = await loadFeaturedProjects(fixtureContent());
    expect(engine?.technologies.map(each => each.id)).toEqual([
      'typescript',
      'react',
    ]);
  });
});
