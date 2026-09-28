import { describe, expect, it } from 'vitest';

import { Author } from './library.fixture.js';
import { loadThroughUseCase } from './load-through-use-case.js';
import { makeStaticRepository } from './static-repository.js';

const author = (id: string, name: string) =>
  Object.assign(new Author(), { id, name });

describe('loadThroughUseCase', () => {
  const repository = makeStaticRepository(Author, [
    author('ada', 'Ada'),
    author('grace', 'Grace'),
    author('alan', 'Alan'),
  ]);

  it('answers a page as the repository reads it, through the use case', async () => {
    const page = await loadThroughUseCase<Author>(repository, {
      filtering: [{ property: 'name', operator: 'like', value: 'a' }],
      sorting: [{ 0: { property: 'name', type: 'desc' } }],
    });
    expect(page.items.map(each => each.id)).toEqual(['grace', 'alan', 'ada']);
    expect(page.total).toBe(3);
  });

  it('asks for the first page when no request is given', async () => {
    const page = await loadThroughUseCase<Author>(repository);
    expect(page.items).toHaveLength(3);
  });
});
