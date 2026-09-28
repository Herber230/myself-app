import type { EntityLoadRequest } from '@entifix/core';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { fetchServing, Note, NOTES_FILE } from './note.fixture.js';
import { staticJsonSource } from './static-json-source.js';
import { useEntityLoad } from './use-entity-load.js';

const source = () =>
  staticJsonSource(
    Note,
    '/data/note.json',
    fetchServing('/data/note.json', NOTES_FILE).fetchFile,
  );

const byTag = (tag: string): EntityLoadRequest<Note> => ({
  filtering: [{ property: 'tags', operator: 'in', values: [tag] }],
});

describe('useEntityLoad', () => {
  it('is idle while asked for nothing', () => {
    const { result } = renderHook(() => useEntityLoad<Note>(source(), null));
    expect(result.current).toEqual({ status: 'idle' });
  });

  it('answers every record the request selects, beyond one page', async () => {
    const notes = source();
    const { result } = renderHook(() =>
      useEntityLoad<Note>(notes, { pageSize: 1 }),
    );
    expect(result.current.status).toBe('pending');
    await waitFor(() => expect(result.current.status).toBe('done'));
    const done = result.current as Extract<
      typeof result.current,
      { status: 'done' }
    >;
    expect(done.page.items).toHaveLength(3);
  });

  it('keeps the last request when an earlier one answers late', async () => {
    const notes = source();
    const { result, rerender } = renderHook(
      ({ tag }) => useEntityLoad<Note>(notes, byTag(tag)),
      { initialProps: { tag: 'web' } },
    );
    rerender({ tag: 'data' });
    await waitFor(() => expect(result.current.status).toBe('done'));
    const done = result.current as Extract<
      typeof result.current,
      { status: 'done' }
    >;
    expect(done.page.items.map(note => note.id)).toEqual([
      'queries',
      'effects',
    ]);
  });

  it('does not ask again for a new request with the same content', async () => {
    const { fetchFile, calls } = fetchServing('/data/note.json', NOTES_FILE);
    const notes = staticJsonSource(Note, '/data/note.json', fetchFile);
    const { result, rerender } = renderHook(() =>
      useEntityLoad<Note>(notes, byTag('web')),
    );
    await waitFor(() => expect(result.current.status).toBe('done'));
    const done = result.current;
    rerender();
    expect(result.current).toBe(done);
    expect(calls).toHaveLength(1);
  });

  it('keeps the last answer from the same source while the next is pending', async () => {
    const notes = source();
    const { result, rerender } = renderHook(
      ({ tag }) => useEntityLoad<Note>(notes, byTag(tag)),
      { initialProps: { tag: 'web' } },
    );
    await waitFor(() => expect(result.current.status).toBe('done'));
    rerender({ tag: 'data' });
    const pending = result.current as Extract<
      typeof result.current,
      { status: 'pending' }
    >;
    expect(pending.status).toBe('pending');
    expect(pending.previous?.items.map(note => note.id)).toEqual([
      'static',
      'queries',
    ]);
    await waitFor(() => expect(result.current.status).toBe('done'));
  });

  it('keeps nothing from a failed answer, or from another source', async () => {
    const missing = staticJsonSource(
      Note,
      '/data/missing.json',
      fetchServing('/data/note.json', NOTES_FILE).fetchFile,
    );
    const { result, rerender } = renderHook(
      ({ from, tag }) => useEntityLoad<Note>(from, byTag(tag)),
      { initialProps: { from: missing, tag: 'web' } },
    );
    await waitFor(() => expect(result.current.status).toBe('failed'));
    rerender({ from: missing, tag: 'data' });
    expect(result.current).toEqual({ status: 'pending' });
    rerender({ from: source(), tag: 'data' });
    expect(result.current).toEqual({ status: 'pending' });
  });

  it('goes back to idle when the request is withdrawn', async () => {
    const notes = source();
    const { result, rerender } = renderHook(
      ({ request }) => useEntityLoad<Note>(notes, request),
      {
        initialProps: {
          request: byTag('web') as EntityLoadRequest<Note> | null,
        },
      },
    );
    await waitFor(() => expect(result.current.status).toBe('done'));
    rerender({ request: null });
    expect(result.current).toEqual({ status: 'idle' });
  });

  it('reports a source that fails', async () => {
    const missing = staticJsonSource(
      Note,
      '/data/missing.json',
      fetchServing('/data/note.json', NOTES_FILE).fetchFile,
    );
    const { result } = renderHook(() =>
      useEntityLoad<Note>(missing, byTag('web')),
    );
    await waitFor(() => expect(result.current.status).toBe('failed'));
  });

  it('shows an older answer only for its own request', async () => {
    let settleFirst: (value: Response) => void = () => undefined;
    let calls = 0;
    const racing = staticJsonSource(Note, '/data/note.json', (() => {
      calls += 1;
      return new Promise<Response>(resolve => (settleFirst = resolve));
    }) as typeof fetch);
    const { result, rerender } = renderHook(
      ({ tag }) => useEntityLoad<Note>(racing, byTag(tag)),
      { initialProps: { tag: 'web' } },
    );
    rerender({ tag: 'data' });
    expect(result.current).toEqual({ status: 'pending' });
    settleFirst(new Response(JSON.stringify(NOTES_FILE)));
    await waitFor(() => expect(result.current.status).toBe('done'));
    const done = result.current as Extract<
      typeof result.current,
      { status: 'done' }
    >;
    expect(done.page.items.map(note => note.id)).toEqual([
      'queries',
      'effects',
    ]);
    expect(calls).toBe(1);
  });
});
