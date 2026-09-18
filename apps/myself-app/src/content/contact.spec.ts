import { CONTENT } from '@myself-app/content';
import { describe, expect, it } from 'vitest';

import { loadContactChannels } from './contact';
import { SITE_REPOSITORIES } from './repositories';
import { buildSiteRepositories } from './site-content';

const ids = (channels: { id: unknown }[]) => channels.map(each => each.id);

describe('the contact channels', () => {
  it('are the shipped ones, in their order', async () => {
    expect(ids(await loadContactChannels(SITE_REPOSITORIES))).toEqual([
      'email',
      'github',
      'linkedin',
    ]);
  });

  it('follow order, not file position', async () => {
    const channels = structuredClone(
      CONTENT['contact-channels.json'],
    ) as Record<string, unknown>[];
    const repositories = buildSiteRepositories({
      ...CONTENT,
      'contact-channels.json': channels.map((channel, index) => ({
        ...channel,
        order: channels.length - index,
      })),
    });
    expect(ids(await loadContactChannels(repositories))).toEqual([
      'linkedin',
      'github',
      'email',
    ]);
  });
});
