import type { StaticContent } from '@myself-app/entifix-incubator-static-adapter';

import { ContactChannel } from '../../entities/contact-channel.entity.js';

function loadInOrder(content: StaticContent): Promise<ContactChannel[]> {
  return content.loadAll(ContactChannel, {
    sorting: [{ 0: { property: 'order', type: 'asc' } }],
  });
}

/**
 * The professional contact links (#32), in their order: the CV's and the
 * landing's contact section. A personal channel is never one of them.
 */
export async function loadContactChannels(
  content: StaticContent,
): Promise<ContactChannel[]> {
  return (await loadInOrder(content)).filter(channel => !channel.personal);
}

/** The personal links, in their order: "Beyond the code" shows them. */
export async function loadPersonalChannels(
  content: StaticContent,
): Promise<ContactChannel[]> {
  return (await loadInOrder(content)).filter(channel => channel.personal);
}
