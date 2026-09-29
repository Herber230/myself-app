import { describe, expect, it } from 'vitest';

import { fixtureContent } from '../content.fixture.js';
import { loadContactChannels } from './load-contact-channels.uc.js';

describe('the contact channels', () => {
  it('follow their order, not their position in the file', async () => {
    const channels = await loadContactChannels(fixtureContent());
    expect(channels.map(each => each.id)).toEqual(['github', 'email']);
  });
});
