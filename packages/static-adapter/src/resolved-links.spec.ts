import { EntityCollectionLink, EntityLink } from '@entifix/core';
import { describe, expect, it } from 'vitest';

import { Author, Shelf } from './library.fixture.js';
import { targetOf, targetsOf } from './resolved-links.js';

describe('targetOf', () => {
  it('reads the record a resolved link names', () => {
    const ada = Object.assign(new Author(), { id: 'ada' });
    expect(targetOf(new EntityLink(Author, { value: ada }))).toBe(ada);
  });

  it('refuses a link nothing resolved, naming it', () => {
    expect(() => targetOf(new EntityLink(Author, { id: 'ada' }))).toThrow(
      'The link to Author ada was read before it was resolved',
    );
  });
});

describe('targetsOf', () => {
  it('reads the records a resolved collection names, in its order', () => {
    const shelves = [
      Object.assign(new Shelf(), { id: 'b' }),
      Object.assign(new Shelf(), { id: 'a' }),
    ];
    expect(
      targetsOf(new EntityCollectionLink(Shelf, { values: shelves })),
    ).toEqual(shelves);
  });

  it('refuses a collection nothing resolved', () => {
    expect(() =>
      targetsOf(new EntityCollectionLink(Shelf, { ids: ['a'] })),
    ).toThrow('The links to Shelf were read before they were resolved');
  });
});
