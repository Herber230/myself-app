/**
 * The content definition over a small library: sources in, validated
 * repositories and reads out, and link targets found from the entities.
 */
import { describe, expect, it } from 'vitest';

import {
  ContentDefinitionError,
  type ContentSource,
  defineSource,
  defineStaticContent,
} from './content-definition.js';
import {
  Author,
  Book,
  LIBRARY,
  Publisher,
  Reprint,
  Shelf,
} from './library.fixture.js';
import { nonEmpty } from './rules.js';
import { ContentValidationError } from './validation.js';

const LOCALES = ['en', 'es'];

const SOURCES: readonly ContentSource[] = [
  defineSource({ entity: Author, file: 'authors.json' }),
  defineSource({ entity: Shelf, file: 'shelves.json' }),
  defineSource({ entity: Book, file: 'books.json' }),
];

const OPTIONS = {
  locales: LOCALES,
  localizedMembersOf: (entity: unknown) =>
    entity === Book ? ['title', 'body'] : [],
};

const define = (
  content = LIBRARY,
  sources = SOURCES,
  options: Parameters<typeof defineStaticContent>[2] = OPTIONS,
) => defineStaticContent(content, sources, options);

/** Every problem the definition reports for some content. */
function problemsIn(...args: Parameters<typeof define>): string[] {
  try {
    define(...args);
  } catch (error) {
    expect(error).toBeInstanceOf(ContentValidationError);
    return (error as ContentValidationError).problems.map(
      problem => `${problem.path} ${problem.message}`,
    );
  }
  return [];
}

const books = () =>
  JSON.parse(JSON.stringify(LIBRARY['books.json'])) as Record<
    string,
    unknown
  >[];

describe('a content definition', () => {
  it('keeps the sources it was given', () => {
    expect(define().sources).toBe(SOURCES);
  });

  it('serves each entity through the use case, filtered and sorted', async () => {
    const content = define();
    const page = await content.load(Book, {
      filtering: [{ property: 'draft', operator: 'eq', value: false }],
      sorting: [{ 0: { property: 'publishedAt', type: 'desc' } }],
      pageSize: 1,
    });
    expect(page.items.map(book => book.id)).toEqual(['compiler']);
    expect(page.total).toBe(2);
    expect((await content.load(Author)).items).toHaveLength(2);
  });

  it('loads every record a request keeps, past one page', async () => {
    const content = define({
      ...LIBRARY,
      'shelves.json': Array.from({ length: 12 }, (_, index) => ({
        id: `s${index}`,
      })),
      'books.json': [],
    });
    expect(await content.loadAll(Shelf)).toHaveLength(12);
    expect(
      await content.loadAll(Shelf, {
        filtering: [{ property: 'id', operator: 'in', values: ['s1', 's2'] }],
      }),
    ).toHaveLength(2);
  });

  it('parses dates and keeps links as ids', async () => {
    const [engine] = await define().loadAll(Book, {
      filtering: [{ property: 'id', operator: 'eq', value: 'engine' }],
    });
    expect(engine?.publishedAt).toEqual(new Date('1843-10-01'));
    expect(engine?.author.id).toBe('ada');
    expect(engine?.shelves.ids).toEqual(['maths', 'machines']);
  });

  it('refuses an entity it has no source for', async () => {
    const content = define();
    expect(() => content.repositoryOf(Publisher)).toThrow(
      new ContentDefinitionError('No source is defined for Publisher'),
    );
    await expect(content.load(Publisher)).rejects.toThrow(
      ContentDefinitionError,
    );
    await expect(content.loadAll(Publisher)).rejects.toThrow(
      ContentDefinitionError,
    );
  });
});

describe('what the definition checks', () => {
  it('passes the library as it is', () => {
    expect(problemsIn()).toEqual([]);
  });

  it('checks every link against the file its target entity is read from', () => {
    const records = books();
    records[0] = { ...records[0], author: 'alan', shelves: ['maths', 'poems'] };
    expect(problemsIn({ ...LIBRARY, 'books.json': records })).toEqual([
      'books.json › engine › author points at "alan", which does not exist',
      'books.json › engine › shelves points at "poems", which does not exist',
    ]);
  });

  it('reads a missing file as empty, and says what links into it', () => {
    const withoutAuthors = Object.fromEntries(
      Object.entries(LIBRARY).filter(([file]) => file !== 'authors.json'),
    );
    expect(problemsIn(withoutAuthors)).toEqual([
      'books.json › engine › author points at "ada", which does not exist',
      'books.json › compiler › author points at "grace", which does not exist',
      'books.json › cobol › author points at "grace", which does not exist',
    ]);
  });

  it('takes no id from a record that has none, and reports that record', () => {
    expect(
      problemsIn({
        ...LIBRARY,
        'authors.json': [null, { name: 'Nobody' }, { id: 'ada', name: 'Ada' }],
      }),
    ).toEqual([
      'authors.json › #0 is not a record',
      'authors.json › #1 › id is missing',
      'books.json › compiler › author points at "grace", which does not exist',
      'books.json › cobol › author points at "grace", which does not exist',
    ]);
  });

  it('checks localized members in every locale, and runs each rule', () => {
    const records = books();
    records[1] = { ...records[1], title: { en: 'The compiler' } };
    expect(
      problemsIn({ ...LIBRARY, 'books.json': records }, [
        ...SOURCES.slice(0, 2),
        defineSource({
          entity: Book,
          file: 'books.json',
          rules: [nonEmpty('shelves')],
        }),
      ]),
    ).toEqual([
      'books.json › compiler › title is missing "es"',
      'books.json › cobol › shelves is empty',
    ]);
  });

  it('treats no member as localized unless told', () => {
    expect(problemsIn(LIBRARY, SOURCES, { locales: LOCALES })).toContain(
      'books.json › engine › title holds a object, not text',
    );
  });

  it('stops on a link to an entity no source declares', () => {
    expect(() =>
      define({ ...LIBRARY, 'reprints.json': [] }, [
        ...SOURCES,
        defineSource({ entity: Reprint, file: 'reprints.json' }),
      ]),
    ).toThrow(
      new ContentDefinitionError(
        'Reprint.publisher links to Publisher, which no source declares',
      ),
    );
  });
});
