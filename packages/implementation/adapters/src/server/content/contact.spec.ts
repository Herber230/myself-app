import { loadContactChannels } from '@myself-app/domain/use-cases';
import { describe, expect, it } from 'vitest';

import { SITE_RECORDS as CONTENT } from '../shipped-content.fixture.js';
import { SITE_CONTENT } from '../shipped-content.fixture.js';
import { buildSiteContent } from '../site-content.js';

const ids = (channels: { id: unknown }[]) => channels.map(each => each.id);

describe('the contact channels', () => {
  it('are the shipped ones, in their order', async () => {
    expect(ids(await loadContactChannels(SITE_CONTENT))).toEqual([
      'email',
      'github',
      'linkedin',
    ]);
  });

  it('follow order, not file position', async () => {
    const channels = structuredClone(
      CONTENT['contact-channels.json'],
    ) as Record<string, unknown>[];
    const content = buildSiteContent({
      ...CONTENT,
      'contact-channels.json': channels.map((channel, index) => ({
        ...channel,
        order: channels.length - index,
      })),
    });
    expect(ids(await loadContactChannels(content))).toEqual([
      'linkedin',
      'github',
      'email',
    ]);
  });
});
