import { loadThroughUseCase } from '@myself-app/entifix-incubator-static-adapter';
import { describe, expect, it } from 'vitest';

import { fetchServing, Note, NOTES_FILE } from './note.fixture.js';
import { staticJsonSource } from './static-json-source.js';

describe('staticJsonSource', () => {
  it('builds a repository from the records the file holds', async () => {
    const { fetchFile } = fetchServing('/data/note.json', NOTES_FILE);
    const source = staticJsonSource(Note, '/data/note.json', fetchFile);
    const page = await loadThroughUseCase<Note>(await source(), {
      filtering: [
        {
          property: 'title.es' as keyof Note,
          operator: 'like',
          value: 'estaticos',
        },
      ],
    });
    expect(page.items.map(note => note.id)).toEqual(['static']);
    expect(page.items[0]).toBeInstanceOf(Note);
    expect(page.items[0]?.writtenAt).toEqual(new Date('2025-03-01'));
  });

  it('fetches the file once, however often it is asked', async () => {
    const { fetchFile, calls } = fetchServing('/data/note.json', NOTES_FILE);
    const source = staticJsonSource(Note, '/data/note.json', fetchFile);
    const [first, second] = await Promise.all([source(), source()]);
    expect(await source()).toBe(first);
    expect(second).toBe(first);
    expect(calls).toEqual(['/data/note.json']);
  });

  it('fails on a missing file, and tries again when asked again', async () => {
    const { fetchFile, calls } = fetchServing('/data/note.json', NOTES_FILE);
    const source = staticJsonSource(Note, '/data/missing.json', fetchFile);
    await expect(source()).rejects.toThrow(
      'Could not read /data/missing.json: 404',
    );
    await expect(source()).rejects.toThrow();
    expect(calls).toHaveLength(2);
  });

  it('fails on a file that holds no list', async () => {
    const { fetchFile } = fetchServing('/data/note.json', 'not a list');
    const source = staticJsonSource(Note, '/data/note.json', fetchFile);
    await expect(source()).rejects.toThrow(
      '/data/note.json does not hold a list of records',
    );
  });

  it('reads through the global fetch unless told otherwise', async () => {
    const { fetchFile, calls } = fetchServing('/data/note.json', NOTES_FILE);
    const original = globalThis.fetch;
    globalThis.fetch = fetchFile;
    try {
      await staticJsonSource(Note, '/data/note.json')();
    } finally {
      globalThis.fetch = original;
    }
    expect(calls).toEqual(['/data/note.json']);
  });
});
