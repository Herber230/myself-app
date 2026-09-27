import { makeStaticRepository } from '@myself-app/static-adapter';
import { describe, expect, it } from 'vitest';

import { loadThroughUseCase } from './load-through-use-case.js';
import { Note, NOTES } from './note.fixture.js';
import { anyOf, containing, defineUrlQuery, inAnyYear } from './url-query.js';

const query = defineUrlQuery({
  params: {
    tag: { allowed: ['web', 'data'], condition: anyOf('tags') },
    year: { condition: inAnyYear('writtenAt') },
    q: {
      single: true,
      condition: containing((locale: 'en' | 'es') => `title.${locale}`),
    },
  },
  sorting: [{ 0: { property: 'writtenAt', type: 'desc' } }],
});

const ids = async (search: string, locale: 'en' | 'es' = 'en') => {
  const page = await loadThroughUseCase<Note>(
    makeStaticRepository(Note, NOTES),
    { ...query.request<Note>(query.parse(search), locale), pageSize: 100 },
  );
  return page.items.map(note => note.id);
};

describe('parse', () => {
  it('reads every declared parameter, in the order given', () => {
    expect(query.parse('?tag=data&tag=web&year=2026&q=que')).toEqual({
      tag: ['data', 'web'],
      year: ['2026'],
      q: ['que'],
    });
  });

  it('drops what is not allowed, blank or repeated, and undeclared names', () => {
    expect(query.parse('?tag=gone&tag=web&tag=web&year=%20&other=1')).toEqual({
      tag: ['web'],
      year: [],
      q: [],
    });
  });

  it('keeps one value of a single parameter, as written', () => {
    expect(query.parse('?q=first%20&q=second').q).toEqual(['first ']);
  });
});

describe('serialize', () => {
  it('writes the parameters in declared order', () => {
    expect(
      query.serialize({ q: ['x y'], tag: ['web', 'data'], year: [] }),
    ).toBe('?tag=web&tag=data&q=x+y');
  });

  it('writes nothing for an empty state', () => {
    expect(query.serialize(query.empty)).toBe('');
  });

  it('round-trips through parse', () => {
    const state = query.parse('?tag=web&year=2025&year=2026&q=sites');
    expect(query.parse(query.serialize(state))).toEqual(state);
  });
});

describe('isEmpty', () => {
  it('is true only when no parameter has a value', () => {
    expect(query.isEmpty(query.empty)).toBe(true);
    expect(query.isEmpty(query.parse('?year=2026'))).toBe(false);
  });
});

describe('request', () => {
  it('asks for everything, sorted, with no parameter set', async () => {
    expect(query.request(query.empty, 'en')).toEqual({
      sorting: [{ 0: { property: 'writtenAt', type: 'desc' } }],
    });
    expect(await ids('')).toEqual(['effects', 'queries', 'static']);
  });

  it('matches any tag, as a collection holds any of them', async () => {
    expect(await ids('?tag=web')).toEqual(['queries', 'static']);
  });

  it('matches any year, both ends included', async () => {
    expect(await ids('?year=2025')).toEqual(['static']);
    expect(await ids('?year=2025&year=2026')).toHaveLength(3);
  });

  it('searches for the text without its surrounding spaces', async () => {
    expect(await ids('?q=%20queries%20')).toEqual(['queries']);
  });

  it('searches the text of the locale asked for', async () => {
    expect(await ids('?q=consultas', 'es')).toEqual(['queries']);
    expect(await ids('?q=consultas', 'en')).toEqual([]);
  });

  it('combines every parameter with and', async () => {
    expect(await ids('?tag=data&year=2026&q=eff')).toEqual(['effects']);
  });

  it('leaves out sorting when none is declared', () => {
    const plain = defineUrlQuery({
      params: { tag: { condition: anyOf('tags') } },
    });
    expect(plain.request(plain.parse('?tag=web'), undefined)).toEqual({
      filtering: [{ property: 'tags', operator: 'in', values: ['web'] }],
    });
  });
});
