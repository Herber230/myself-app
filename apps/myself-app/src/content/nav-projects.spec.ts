import { loadFeaturedProjects } from '@myself-app/domain/use-cases';
import { NAV_PROJECTS } from '@myself-app/implementation-ui/routing';
import { describe, expect, it } from 'vitest';

import { SITE_CONTENT } from '../composition';

/** The UI names the nav's projects; this holds them to the content. */
describe('the nav’s projects', () => {
  it('are the featured projects, in their order and by their names', async () => {
    const featured = await loadFeaturedProjects(SITE_CONTENT);
    expect(NAV_PROJECTS).toEqual(
      featured.map(({ project }) => ({
        id: String(project.id),
        name: project.name,
      })),
    );
  });
});
