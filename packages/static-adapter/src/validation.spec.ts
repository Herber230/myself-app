/**
 * Each rule, with a record that breaks it.
 *
 * entifix's mapping checks nothing on the way in, so every case below is one
 * that would otherwise reach a visitor: a missing translation rendered as
 * `undefined`, a date left a string, a link to a record that does not exist.
 */
import {
  accessor,
  type Entity,
  entity,
  EntityCollectionLink as CollectionLink,
  type EntityCollectionLink,
  type EntityId,
  EntityLink,
} from '@entifix/core';
import { describe, expect, it } from 'vitest';

import {
  ContentValidationError,
  type EntityRule,
  validateRecords,
  validRecordsOrThrow,
} from './validation.js';

@entity({ key: 'employer' })
class Employer implements Entity {
  #id?: EntityId;

  @accessor({ type: 'id' })
  get id(): EntityId {
    return this.#id;
  }
  set id(value: EntityId) {
    this.#id = value;
  }
}

@entity({ key: 'period' })
class Period implements Entity {
  #id?: EntityId;
  #role?: unknown;
  #start?: Date;
  #end?: Date;
  #kind?: string;
  #order?: number;
  #current?: boolean;
  #note?: string;
  #status?: string;
  #employer = new EntityLink(Employer);
  #teams = new CollectionLink(Employer);

  @accessor({ type: 'id' })
  get id(): EntityId {
    return this.#id;
  }
  set id(value: EntityId) {
    this.#id = value;
  }

  @accessor({ type: 'string', required: true })
  get role(): unknown {
    return this.#role;
  }
  set role(value: unknown) {
    this.#role = value;
  }

  @accessor({ type: 'date', required: true })
  get start(): Date | undefined {
    return this.#start;
  }
  set start(value: Date | undefined) {
    this.#start = value;
  }

  @accessor({ type: 'date' })
  get end(): Date | undefined {
    return this.#end;
  }
  set end(value: Date | undefined) {
    this.#end = value;
  }

  @accessor({ type: 'enum', enumValues: ['full', 'part'] })
  get kind(): string | undefined {
    return this.#kind;
  }
  set kind(value: string | undefined) {
    this.#kind = value;
  }

  @accessor({ type: 'number' })
  get order(): number | undefined {
    return this.#order;
  }
  set order(value: number | undefined) {
    this.#order = value;
  }

  @accessor({ type: 'boolean' })
  get current(): boolean | undefined {
    return this.#current;
  }
  set current(value: boolean | undefined) {
    this.#current = value;
  }

  @accessor({ type: 'string' })
  get note(): string | undefined {
    return this.#note;
  }
  set note(value: string | undefined) {
    this.#note = value;
  }

  /** An enum whose values were never declared: nothing can satisfy it. */
  @accessor({ type: 'enum' })
  get status(): string | undefined {
    return this.#status;
  }
  set status(value: string | undefined) {
    this.#status = value;
  }

  @accessor({ type: 'link' })
  get employer(): EntityLink<Employer> {
    return this.#employer;
  }

  @accessor({ type: 'linkCollection' })
  get teams(): EntityCollectionLink<Employer> {
    return this.#teams;
  }
}

const OPTIONS = {
  source: 'employment.json',
  locales: ['en', 'es'],
  localizedMembers: ['role'],
  linkTargets: {
    employer: new Set<EntityId>(['acme']),
    teams: new Set<EntityId>(['acme']),
  },
};

const VALID = {
  id: 'acme-lead',
  role: { en: 'Tech Lead', es: 'Líder técnico' },
  start: '2021-02-01',
  employer: 'acme',
};

const messagesFor = (records: unknown[], options = OPTIONS) =>
  validateRecords(Period, records, options).problems.map(
    problem => `${problem.path} ${problem.message}`,
  );

describe('a valid record', () => {
  it('passes, and comes back with its dates parsed', () => {
    const { problems, records } = validateRecords(Period, [VALID], OPTIONS);
    expect(problems).toEqual([]);
    expect(records[0].start).toBeInstanceOf(Date);
    expect((records[0].start as Date).toISOString()).toBe(
      '2021-02-01T00:00:00.000Z',
    );
  });

  it('does not change the record it was handed', () => {
    const raw = { ...VALID };
    validateRecords(Period, [raw], OPTIONS);
    expect(raw.start).toBe('2021-02-01');
  });

  it('keeps a date that is already a Date, and a timestamp', () => {
    const at = new Date('2020-01-01');
    const { problems, records } = validateRecords(
      Period,
      [
        { ...VALID, start: at },
        { ...VALID, id: 'other', start: at.getTime() },
      ],
      OPTIONS,
    );
    expect(problems).toEqual([]);
    expect(records[0].start).toBe(at);
    expect((records[1].start as Date).getTime()).toBe(at.getTime());
  });

  it('accepts every scalar type the metadata declares', () => {
    expect(
      messagesFor([
        {
          ...VALID,
          kind: 'full',
          order: 3,
          current: true,
          note: 'a note',
          teams: ['acme', { id: 'embedded' }],
        },
      ]),
    ).toEqual([]);
  });
});

describe('a localized member', () => {
  it('names the locale it is missing, with the path to it', () => {
    expect(messagesFor([{ ...VALID, role: { en: 'Tech Lead' } }])).toEqual([
      'employment.json › acme-lead › role is missing "es"',
    ]);
  });

  it('rejects an empty translation and one that is not text', () => {
    expect(messagesFor([{ ...VALID, role: { en: '  ', es: 4 } }])).toEqual([
      'employment.json › acme-lead › role is empty for "en"',
      'employment.json › acme-lead › role holds a number for "es", not text',
    ]);
  });

  it('rejects a plain string where both languages are expected', () => {
    expect(messagesFor([{ ...VALID, role: 'Tech Lead' }])).toEqual([
      'employment.json › acme-lead › role is not a localized object',
    ]);
  });

  it('names every record that lacks a locale added to the list', () => {
    // What happens the day a third locale joins SITE_LOCALES: every record is
    // named, rather than the first.
    const problems = messagesFor([VALID, { ...VALID, id: 'acme-dev' }], {
      ...OPTIONS,
      locales: ['en', 'es', 'pt'],
    });
    expect(problems).toEqual([
      'employment.json › acme-lead › role is missing "pt"',
      'employment.json › acme-dev › role is missing "pt"',
    ]);
  });
});

describe('a required member', () => {
  it('is reported when missing, null or empty', () => {
    expect(
      messagesFor([
        { id: 'a', role: VALID.role, employer: 'acme' },
        { id: 'b', role: null, start: VALID.start },
        { id: 'c', role: '', start: VALID.start },
      ]),
    ).toEqual([
      'employment.json › a › start is required, and is missing',
      'employment.json › b › role is required, and is missing',
      'employment.json › c › role is required, and is missing',
    ]);
  });
});

describe('a date member', () => {
  it('is reported when it does not parse', () => {
    expect(
      messagesFor([
        { ...VALID, start: 'someday' },
        { ...VALID, id: 'x', start: new Date('nope') },
        { ...VALID, id: 'y', start: true },
      ]),
    ).toEqual([
      'employment.json › acme-lead › start is not a date: "someday"',
      'employment.json › x › start is an invalid date',
      'employment.json › y › start holds a boolean, not a date',
    ]);
  });
});

describe('a scalar member', () => {
  it('is reported when it holds the wrong type', () => {
    expect(
      messagesFor([
        {
          ...VALID,
          kind: 'contract',
          order: 'first',
          current: 'yes',
          note: { text: 'x' },
        },
      ]),
    ).toEqual([
      'employment.json › acme-lead › kind holds "contract", which is not one of ["full","part"]',
      'employment.json › acme-lead › order holds "first", not a number',
      'employment.json › acme-lead › current holds "yes", not a boolean',
      'employment.json › acme-lead › note holds a object, not text',
    ]);
  });

  it('rejects every value of an enum that declares none', () => {
    expect(messagesFor([{ ...VALID, status: 'open' }])).toEqual([
      'employment.json › acme-lead › status holds "open", which is not one of []',
    ]);
  });

  it('reports NaN as not a number', () => {
    expect(messagesFor([{ ...VALID, order: Number.NaN }])).toEqual([
      'employment.json › acme-lead › order holds null, not a number',
    ]);
  });
});

describe('a link member', () => {
  it('is reported when it points at nothing', () => {
    expect(
      messagesFor([
        { ...VALID, employer: 'globex', teams: ['acme', 'initech'] },
      ]),
    ).toEqual([
      'employment.json › acme-lead › employer points at "globex", which does not exist',
      'employment.json › acme-lead › teams points at "initech", which does not exist',
    ]);
  });

  it('is reported when it is not an id at all', () => {
    expect(messagesFor([{ ...VALID, employer: true, teams: 'acme' }])).toEqual([
      'employment.json › acme-lead › employer holds a boolean where an id was expected',
      'employment.json › acme-lead › teams is not a list of ids',
    ]);
  });

  it('is not checked against targets nobody supplied', () => {
    expect(
      messagesFor([{ ...VALID, employer: 'anyone' }], {
        ...OPTIONS,
        linkTargets: {} as typeof OPTIONS.linkTargets,
      }),
    ).toEqual([]);
  });
});

describe('the records as a whole', () => {
  it('reports a duplicate id, a missing one, and a value that is no record', () => {
    expect(
      messagesFor([VALID, VALID, { ...VALID, id: undefined }, 'not a record']),
    ).toEqual([
      'employment.json › acme-lead › id is used more than once',
      'employment.json › #2 › id is missing',
      'employment.json › #3 is not a record',
    ]);
  });

  it('collects every problem instead of stopping at the first', () => {
    expect(
      messagesFor([{ id: 'broken', role: { en: 'x' }, start: 'soon' }]),
    ).toHaveLength(2);
  });

  it('defaults to no localized members, targets or rules', () => {
    expect(
      validateRecords(Period, [{ ...VALID, role: 'plain' }], {
        source: 'employment.json',
        locales: ['en'],
      }).problems,
    ).toEqual([]);
  });
});

describe('a rule registered by the caller', () => {
  const endNotBeforeStart: EntityRule = (records, report) => {
    records.forEach((record, index) => {
      if (
        record.end instanceof Date &&
        record.start instanceof Date &&
        record.end < record.start
      ) {
        report(index, 'end', 'is before start');
      }
    });
  };

  it('runs on the parsed records, and reports with the same path', () => {
    expect(
      messagesFor([{ ...VALID, end: '2020-01-01' }], {
        ...OPTIONS,
        rules: [endNotBeforeStart],
      } as typeof OPTIONS),
    ).toEqual(['employment.json › acme-lead › end is before start']);
  });

  it('can report against the record, and against one with no id', () => {
    const everything: EntityRule = (records, report) => {
      report(0, undefined, 'is wrong as a whole');
      report(records.length, undefined, 'is past the end');
    };
    expect(
      messagesFor([VALID], {
        ...OPTIONS,
        rules: [everything],
      } as typeof OPTIONS),
    ).toEqual([
      'employment.json › acme-lead is wrong as a whole',
      'employment.json › #1 is past the end',
    ]);
  });
});

describe('validRecordsOrThrow', () => {
  it('hands back the parsed records when there is nothing wrong', () => {
    const records = validRecordsOrThrow(Period, [VALID], OPTIONS);
    expect(records).toHaveLength(1);
  });

  it('throws one error carrying every problem, each on its own line', () => {
    let thrown: unknown;
    try {
      validRecordsOrThrow(
        Period,
        [{ id: 'broken', role: { en: 'x' }, start: 'soon' }],
        OPTIONS,
      );
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBeInstanceOf(ContentValidationError);
    const error = thrown as ContentValidationError;
    expect(error.problems).toHaveLength(2);
    expect(error.message).toContain(
      '  employment.json › broken › role is missing "es"',
    );
    expect(error.message).toContain(
      '  employment.json › broken › start is not a date: "soon"',
    );
  });
});
