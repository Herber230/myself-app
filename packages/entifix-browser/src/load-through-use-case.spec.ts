import { makeStaticRepository } from '@myself-app/static-adapter';
import { describe, expect, it } from 'vitest';

import { loadThroughUseCase } from './load-through-use-case.js';
import { Note, NOTES } from './note.fixture.js';

describe('loadThroughUseCase', () => {
  const repository = makeStaticRepository(Note, NOTES);

  it('answers a page as the repository reads it, through the use case', async () => {
    const page = await loadThroughUseCase<Note>(repository, {
      filtering: [{ property: 'tags', operator: 'in', values: ['data'] }],
      sorting: [{ 0: { property: 'writtenAt', type: 'desc' } }],
    });
    expect(page.items.map(note => note.id)).toEqual(['effects', 'queries']);
    expect(page.total).toBe(2);
  });

  it('asks for the first page when no request is given', async () => {
    const page = await loadThroughUseCase<Note>(repository);
    expect(page.items).toHaveLength(3);
  });
});
