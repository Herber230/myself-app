/**
 * The contact and social links (#32), in their order.
 */
import { ContactChannel } from '@myself-app/domain';

import type { SiteContent } from './site-content';

export function loadContactChannels(
  content: SiteContent,
): Promise<ContactChannel[]> {
  return content.loadAll(ContactChannel, {
    sorting: [{ 0: { property: 'order', type: 'asc' } }],
  });
}
