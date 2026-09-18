/**
 * The contact and social links (#32), in their order.
 */
import { ContactChannel } from '@myself-app/domain';

import { loadEvery } from './queries';
import type { SiteRepositories } from './site-content';

export function loadContactChannels(
  repositories: SiteRepositories,
): Promise<ContactChannel[]> {
  return loadEvery(repositories, ContactChannel, {
    sorting: [{ 0: { property: 'order', type: 'asc' } }],
  });
}
