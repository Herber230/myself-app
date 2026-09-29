/**
 * Link resolution over static repositories. What this catches is a
 * registration that was forgotten: the resolver then fails with the entity's
 * name rather than resolving `undefined` into a page.
 */
import { EntityLinkResolverTag } from '@entifix/business';
import {
  accessor,
  type Entity,
  entity,
  type EntityId,
  EntityLink,
} from '@entifix/core';
import { Cause, Context, Effect, Exit } from 'effect';
import { describe, expect, it } from 'vitest';

import { makeStaticLinkResolver } from './link-resolver.js';
import { makeStaticRepository } from './static-repository.js';

@entity({ key: 'author' })
class Author implements Entity {
  #id?: EntityId;
  #name = '';

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

@entity({ key: 'unregistered' })
class Unregistered implements Entity {
  #id?: EntityId;

  @accessor({ type: 'id' })
  get id(): EntityId {
    return this.#id;
  }
  set id(value: EntityId) {
    this.#id = value;
  }
}

const author = (id: string, name: string) => {
  const instance = new Author();
  instance.id = id;
  instance.name = name;
  return instance;
};

const resolverOf = () =>
  Context.get(
    makeStaticLinkResolver([
      [Author, makeStaticRepository(Author, [author('a-1', 'Ada')])],
    ]),
    EntityLinkResolverTag,
  );

describe('a static link resolver', () => {
  it('resolves an id to the record it names', async () => {
    const resolved = await Effect.runPromise(
      resolverOf().resolve(Author, 'a-1'),
    );
    expect(resolved.name).toBe('Ada');
  });

  it('populates a link on the entity that holds it', async () => {
    const link = new EntityLink(Author);
    link.setId('a-1');
    expect(link.isLoaded).toBe(false);

    const resolved = await Effect.runPromise(
      resolverOf().resolve(Author, link.id),
    );
    expect(resolved.name).toBe('Ada');
  });

  it('fails when the id names nothing', async () => {
    const exit = await Effect.runPromiseExit(
      resolverOf().resolve(Author, 'missing'),
    );
    expect(Exit.isFailure(exit)).toBe(true);
  });

  it('names the entity when nothing is registered for it', async () => {
    const exit = await Effect.runPromiseExit(
      resolverOf().resolve(Unregistered, 'whatever'),
    );
    expect(Exit.isFailure(exit)).toBe(true);
    const failure = Cause.failureOption(
      (exit as Exit.Failure<unknown, Error>).cause,
    );
    expect((failure as { value: Error }).value.message).toContain(
      'Unregistered',
    );
  });
});
