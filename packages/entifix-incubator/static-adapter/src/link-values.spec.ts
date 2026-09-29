import { type Entity, EntityCollectionLink, EntityLink } from '@entifix/core';
import { describe, expect, it } from 'vitest';

import { plainValue } from './link-values.js';

class Target implements Entity {
  id = '';
}

describe('a member as the Mongo adapter sees it', () => {
  it('is the id of a link', () => {
    expect(plainValue(new EntityLink(Target, { id: 'adopt' }))).toBe('adopt');
  });

  it('is the ids of a collection link', () => {
    expect(
      plainValue(new EntityCollectionLink(Target, { ids: ['css', 'web'] })),
    ).toEqual(['css', 'web']);
  });

  it('is itself for anything else', () => {
    const date = new Date('2020-01-01');
    expect(plainValue('adopt')).toBe('adopt');
    expect(plainValue(date)).toBe(date);
    expect(plainValue(undefined)).toBeUndefined();
  });
});
