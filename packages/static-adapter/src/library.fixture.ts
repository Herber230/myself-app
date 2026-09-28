import {
  accessor,
  type Entity,
  entity,
  EntityCollectionLink,
  type EntityId,
  EntityLink,
} from '@entifix/core';

/**
 * Fixture entities for the content definition's specs: a book links to one
 * author and to many shelves, and has a localized title and body, a date and
 * a draft flag. They stand for no entity of the site.
 */

type Localized = { en: string; es: string };

@entity({ key: 'author' })
export class Author implements Entity {
  #id?: EntityId;
  #name?: string;

  @accessor({ type: 'id' })
  get id(): EntityId {
    return this.#id;
  }
  set id(value: EntityId) {
    this.#id = value;
  }

  @accessor({ type: 'string', required: true, filterable: true })
  get name(): string | undefined {
    return this.#name;
  }
  set name(value: string | undefined) {
    this.#name = value;
  }
}

@entity({ key: 'shelf' })
export class Shelf implements Entity {
  #id?: EntityId;

  @accessor({ type: 'id' })
  get id(): EntityId {
    return this.#id;
  }
  set id(value: EntityId) {
    this.#id = value;
  }
}

/** An entity no source declares, for a link that has nowhere to point. */
@entity({ key: 'publisher' })
export class Publisher implements Entity {
  #id?: EntityId;

  @accessor({ type: 'id' })
  get id(): EntityId {
    return this.#id;
  }
  set id(value: EntityId) {
    this.#id = value;
  }
}

@entity({ key: 'book' })
export class Book implements Entity {
  #id?: EntityId;
  #title?: Localized;
  #body?: Localized;
  #publishedAt?: Date;
  #draft = false;
  #author = new EntityLink(Author);
  #shelves = new EntityCollectionLink(Shelf);

  @accessor({ type: 'id' })
  get id(): EntityId {
    return this.#id;
  }
  set id(value: EntityId) {
    this.#id = value;
  }

  @accessor({ type: 'string', filterable: false, sortable: false })
  get title(): Localized | undefined {
    return this.#title;
  }
  set title(value: Localized | undefined) {
    this.#title = value;
  }

  @accessor({ type: 'string', filterable: false, sortable: false })
  get body(): Localized | undefined {
    return this.#body;
  }
  set body(value: Localized | undefined) {
    this.#body = value;
  }

  @accessor({ type: 'date', filterable: true, sortable: true })
  get publishedAt(): Date | undefined {
    return this.#publishedAt;
  }
  set publishedAt(value: Date | undefined) {
    this.#publishedAt = value;
  }

  @accessor({ type: 'boolean', filterable: true })
  get draft(): boolean {
    return this.#draft;
  }
  set draft(value: boolean) {
    this.#draft = value;
  }

  @accessor({ type: 'link' })
  get author(): EntityLink<Author> {
    return this.#author;
  }

  @accessor({ type: 'linkCollection' })
  get shelves(): EntityCollectionLink<Shelf> {
    return this.#shelves;
  }
}

/** A book whose publisher no source declares. */
@entity({ key: 'reprint' })
export class Reprint implements Entity {
  #id?: EntityId;
  #publisher = new EntityLink(Publisher);

  @accessor({ type: 'id' })
  get id(): EntityId {
    return this.#id;
  }
  set id(value: EntityId) {
    this.#id = value;
  }

  @accessor({ type: 'link' })
  get publisher(): EntityLink<Publisher> {
    return this.#publisher;
  }
}

/** The records a library's files hold, as JSON would. */
export const LIBRARY: Readonly<Record<string, readonly unknown[]>> = {
  'authors.json': [
    { id: 'ada', name: 'Ada' },
    { id: 'grace', name: 'Grace' },
  ],
  'shelves.json': [{ id: 'maths' }, { id: 'machines' }],
  'books.json': [
    {
      id: 'engine',
      title: { en: 'The engine', es: 'La máquina' },
      body: { en: 'Notes.', es: 'Notas.' },
      publishedAt: '1843-10-01',
      draft: false,
      author: 'ada',
      shelves: ['maths', 'machines'],
    },
    {
      id: 'compiler',
      title: { en: 'The compiler', es: 'El compilador' },
      body: { en: 'A-0.', es: 'A-0.' },
      publishedAt: '1952-05-01',
      draft: false,
      author: 'grace',
      shelves: ['machines'],
    },
    {
      id: 'cobol',
      title: { en: 'COBOL', es: 'COBOL' },
      body: { en: 'Draft.', es: 'Borrador.' },
      publishedAt: '1959-01-01',
      draft: true,
      author: 'grace',
      shelves: [],
    },
  ],
};
