/**
 * The landing page's projects (#30): the featured ones, in their order, read
 * through the `load` use case like every other page read (ADR 0003, path A).
 */
import { Project } from '@myself-app/domain';

import type { SiteContent } from './site-content';

export function loadFeaturedProjects(content: SiteContent): Promise<Project[]> {
  return content.loadAll(Project, {
    filtering: [{ property: 'featured', operator: 'eq', value: true }],
    sorting: [{ 0: { property: 'order', type: 'asc' } }],
  });
}
