import { describe, expect, it } from 'vitest';

import { readPostBodyFile, withPostBodies } from './post-bodies';

describe('readPostBodyFile', () => {
  it('reads a post’s Markdown from the content package', () => {
    expect(readPostBodyFile('entifix-in-the-browser', 'en')).toContain(
      ':::lead',
    );
  });

  it('answers undefined for a file that does not exist', () => {
    expect(readPostBodyFile('no-such-post', 'es')).toBeUndefined();
  });
});

describe('withPostBodies', () => {
  const read = (id: string, locale: string) =>
    id === 'whole' || locale === 'en' ? `${id} in ${locale}` : undefined;

  it('attaches each post’s body, with the locales that have a file', () => {
    const content = withPostBodies(
      { 'posts.json': [{ id: 'whole' }, { id: 'half' }], 'tags.json': [] },
      read,
    );
    expect(content['posts.json']).toEqual([
      { id: 'whole', body: { en: 'whole in en', es: 'whole in es' } },
      { id: 'half', body: { en: 'half in en' } },
    ]);
    expect(content['tags.json']).toEqual([]);
  });

  it('leaves what is not a post record for validation to report', () => {
    expect(
      withPostBodies({ 'posts.json': ['text', null, { id: 3 }] }, read)[
        'posts.json'
      ],
    ).toEqual(['text', null, { id: 3 }]);
  });

  it('adds an empty list of posts when there is no posts file', () => {
    expect(withPostBodies({}, read)['posts.json']).toEqual([]);
  });
});
