import {
  accessor,
  type Entity,
  entity,
  type EntityId,
  serializeEntityCollection,
} from '@entifix/core';

/** A fixture entity: an id, a localized title, tags and a date. */
@entity({ key: 'note' })
export class Note implements Entity {
  #id?: EntityId;
  #title?: { en: string; es: string };
  #tags: string[] = [];
  #writtenAt?: Date;

  @accessor({ type: 'id' })
  get id(): EntityId {
    return this.#id;
  }
  set id(value: EntityId) {
    this.#id = value;
  }

  @accessor({ type: 'string' })
  get title(): { en: string; es: string } | undefined {
    return this.#title;
  }
  set title(value: { en: string; es: string } | undefined) {
    this.#title = value;
  }

  @accessor({ type: 'scalarCollection' })
  get tags(): string[] {
    return this.#tags;
  }
  set tags(value: string[]) {
    this.#tags = value;
  }

  @accessor({ type: 'date', sortable: true })
  get writtenAt(): Date | undefined {
    return this.#writtenAt;
  }
  set writtenAt(value: Date | undefined) {
    this.#writtenAt = value;
  }
}

function note(
  id: string,
  en: string,
  es: string,
  tags: string[],
  writtenAt: string,
): Note {
  const record = new Note();
  record.id = id;
  record.title = { en, es };
  record.tags = tags;
  record.writtenAt = new Date(writtenAt);
  return record;
}

export const NOTES = [
  note('static', 'Static sites', 'Sitios estáticos', ['web'], '2025-03-01'),
  note('queries', 'Queries', 'Consultas', ['data', 'web'], '2026-01-15'),
  note('effects', 'Effects', 'Efectos', ['data'], '2026-06-30'),
];

/** The file a build writes for the notes, as `/data/note.json` would hold. */
export const NOTES_FILE = serializeEntityCollection(Note, NOTES);

/** A `fetch` answering one URL with a JSON body, and 404 for any other. */
export function fetchServing(url: string, body: unknown) {
  const calls: string[] = [];
  const fetchFile = (async (input: RequestInfo | URL) => {
    calls.push(String(input));
    return String(input) === url
      ? new Response(JSON.stringify(body), { status: 200 })
      : new Response('', { status: 404 });
  }) as typeof fetch;
  return { fetchFile, calls };
}
