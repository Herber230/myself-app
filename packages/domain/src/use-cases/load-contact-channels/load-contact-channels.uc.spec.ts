import { describe, expect, it } from 'vitest';

import { fixtureContent } from '../content.fixture.js';
import {
  loadContactChannels,
  loadPersonalChannels,
} from './load-contact-channels.uc.js';

describe('the contact channels', () => {
  it('follow their order, not their position in the file', async () => {
    const channels = await loadContactChannels(fixtureContent());
    expect(channels.map(each => each.id)).toEqual(['github', 'email']);
  });

  it('leave out a personal channel, which the CV must never show', async () => {
    const channels = await loadContactChannels(fixtureContent());
    expect(channels.some(each => each.personal)).toBe(false);
  });
});

describe('the personal channels', () => {
  it('are only the personal ones, in their order', async () => {
    const channels = await loadPersonalChannels(fixtureContent());
    expect(channels.map(each => each.id)).toEqual(['instagram', 'goodreads']);
  });
});
