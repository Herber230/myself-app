import { accessor, type Entity, entity, type EntityId } from '@entifix/core';
import { describe, expect, it } from 'vitest';

import { withDatesParsed } from './dates.js';

@entity({ key: 'dated' })
class Dated implements Entity {
  #id?: EntityId;
  #on?: Date;
  #label = '';

  @accessor({ type: 'id' })
  get id(): EntityId {
    return this.#id;
  }
  set id(value: EntityId) {
    this.#id = value;
  }

  @accessor({ type: 'date' })
  get on(): Date | undefined {
    return this.#on;
  }
  set on(value: Date | undefined) {
    this.#on = value;
  }

  @accessor({ type: 'string' })
  get label(): string {
    return this.#label;
  }
  set label(value: string) {
    this.#label = value;
  }
}

describe('withDatesParsed', () => {
  it('turns a date member held as text into a Date, and nothing else', () => {
    const [record] = withDatesParsed(Dated, [
      { id: 'a', on: '2026-09-25T00:00:00.000Z', label: '2026-09-25' },
    ]);
    expect(record).toEqual({
      id: 'a',
      on: new Date('2026-09-25T00:00:00.000Z'),
      label: '2026-09-25',
    });
  });

  it('leaves what is not text, and what is not a record, as it is', () => {
    const on = new Date('2026-01-01');
    expect(
      withDatesParsed(Dated, [{ id: 'b', on }, { id: 'c' }, 'x', null]),
    ).toEqual([{ id: 'b', on }, { id: 'c' }, 'x', null]);
  });

  it('does not change the records it was given', () => {
    const records = [{ id: 'd', on: '2026-02-02' }];
    withDatesParsed(Dated, records);
    expect(records[0]?.on).toBe('2026-02-02');
  });
});
