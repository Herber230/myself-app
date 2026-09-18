/**
 * How a record leaves the store.
 *
 * Handing out the instance it holds is the defect entifix fixed in its own
 * double (entifix#21): a caller mutates what it read, and the next page shows
 * the mutation with nothing reporting it. A copy is made through the entity's
 * own mapping, so the two ways that can go wrong are covered here — an entity
 * with no metadata to map through, and a mapping that fails.
 */
import {
  accessor,
  EntifixConnError,
  type Entity,
  entity,
  type EntityId,
} from '@entifix/core';
import { runRepository, runRepositoryExit } from '@entifix/testing-unit';
import { Cause, Exit } from 'effect';
import { describe, expect, it } from 'vitest';

import { makeStaticRepository } from './static-repository.js';

/** No `@entity`, no `@accessor`: nothing for the mapping to walk. */
class Bare implements Entity {
  constructor(
    public id: EntityId,
    public label: string,
  ) {}

  shout(): string {
    return this.label.toUpperCase();
  }
}

/** Constructed once while it is willing, then made to refuse. */
let refuseToConstruct = false;

@entity({ key: 'fragile' })
class Fragile implements Entity {
  #id?: EntityId;
  #name = '';

  constructor() {
    if (refuseToConstruct) throw new Error('cannot be constructed');
  }

  @accessor({ type: 'id' })
  get id(): EntityId {
    return this.#id;
  }
  set id(value: EntityId) {
    this.#id = value;
  }

  @accessor({ type: 'string' })
  get name(): string {
    return this.#name;
  }
  set name(value: string) {
    this.#name = value;
  }
}

describe('a record with no metadata', () => {
  const repository = () =>
    makeStaticRepository(Bare, [new Bare('b-1', 'plain')]);

  it('is still copied rather than handed out', async () => {
    const first = await runRepository(repository().get<Bare>('b-1'));
    const store = repository();
    const read = await runRepository(store.get<Bare>('b-1'));
    read.label = 'mutated';

    const again = await runRepository(store.get<Bare>('b-1'));
    expect(again.label).toBe('plain');
    expect(first.label).toBe('plain');
  });

  it('keeps its prototype, so its methods still work', async () => {
    const read = await runRepository(repository().get<Bare>('b-1'));
    expect(read).toBeInstanceOf(Bare);
    expect(read.shout()).toBe('PLAIN');
  });
});

describe('a record that cannot be copied', () => {
  it('fails as a connection error rather than throwing', async () => {
    const record = new Fragile();
    record.id = 'f-1';
    record.name = 'Fragile';
    const repository = makeStaticRepository(Fragile, [record]);

    refuseToConstruct = true;
    try {
      const exit = await runRepositoryExit(repository.get<Fragile>('f-1'));
      expect(Exit.isFailure(exit)).toBe(true);
      const failure = Cause.failureOption(
        (exit as Exit.Failure<unknown, EntifixConnError>).cause,
      );
      const error = (failure as { value: EntifixConnError }).value;
      expect(error).toBeInstanceOf(EntifixConnError);
      expect(error.message).toContain('Fragile');
    } finally {
      refuseToConstruct = false;
    }
  });
});
