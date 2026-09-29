import type { StaticContent } from '@myself-app/entifix-incubator-static-adapter';

import { ContactChannel } from '../../entities/contact-channel.entity.js';

/** The contact and social links (#32), in their order. */
export function loadContactChannels(
  content: StaticContent,
): Promise<ContactChannel[]> {
  return content.loadAll(ContactChannel, {
    sorting: [{ 0: { property: 'order', type: 'asc' } }],
  });
}
