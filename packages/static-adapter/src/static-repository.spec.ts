/**
 * The adapter, against entifix's own fixture.
 *
 * The contract below is the read half; what this file adds is the half no
 * contract covers: the two write verbs refusing, and array membership, which
 * entifix's in-memory double gets wrong (entifix#34) and which is the radar's
 * first query.
 */
import { EntifixLogicError } from '@entifix/core';
import { runRepository, runRepositoryExit } from '@entifix/testing-unit';
import {
  ContractWidget,
  makeContractWidget,
} from '@entifix/testing-unit/contracts';
import { Cause, Exit } from 'effect';
import { describe, expect, it } from 'vitest';

import { describeReadOnlyEntityRepositoryContract } from './contracts/read-only-repository.contract.js';
import { makeStaticRepository } from './static-repository.js';

describeReadOnlyEntityRepositoryContract('the static adapter', {
  makeRepository: seed => makeStaticRepository(ContractWidget, seed),
});

/** The one failure of an `Exit`, or a thrown assertion. */
function failureOf<E>(exit: Exit.Exit<unknown, E>): E {
  expect(Exit.isFailure(exit)).toBe(true);
  const failure = Cause.failureOption((exit as Exit.Failure<unknown, E>).cause);
  expect(failure._tag).toBe('Some');
  return (failure as { value: E }).value;
}

describe('a static repository asked to write', () => {
  const subject = () =>
    makeStaticRepository(ContractWidget, [
      makeContractWidget('w-1', 'Alpha', 10),
    ]);

  it('refuses to save, and says why', async () => {
    const error = failureOf(
      await runRepositoryExit(
        subject().save(makeContractWidget('w-2', 'Beta', 20)),
      ),
    );
    expect(error).toBeInstanceOf(EntifixLogicError);
    expect(error.message).toContain('read-only');
    expect(error.message).toContain('ContractWidget');
  });

  it('refuses to delete, and says why', async () => {
    const error = failureOf(await runRepositoryExit(subject().delete('w-1')));
    expect(error).toBeInstanceOf(EntifixLogicError);
    expect(error.message).toContain('read-only');
  });

  it('names the source in the label it was given', async () => {
    const labelled = makeStaticRepository(ContractWidget, [], {
      label: 'Technology',
    });
    const error = failureOf(await runRepositoryExit(labelled.delete('x')));
    expect(error.message).toContain('Technology');
  });

  it('still holds what it held after a refused write', async () => {
    const repository = subject();
    await runRepositoryExit(repository.delete('w-1'));
    const page = await runRepository(repository.load<ContractWidget>({}));
    expect(page.items.map(widget => widget.id)).toEqual(['w-1']);
  });
});

describe('a static repository handed a list', () => {
  it('does not change when that list is changed afterwards', async () => {
    const seed = [makeContractWidget('w-1', 'Alpha', 10)];
    const repository = makeStaticRepository(ContractWidget, seed);
    seed.push(makeContractWidget('w-2', 'Beta', 20));

    const page = await runRepository(repository.load<ContractWidget>({}));
    expect(page.items.map(widget => widget.id)).toEqual(['w-1']);
  });

  it('hands out a copy from get, not the record it holds', async () => {
    const repository = makeStaticRepository(ContractWidget, [
      makeContractWidget('w-1', 'Alpha', 10),
    ]);
    const first = await runRepository(repository.get<ContractWidget>('w-1'));
    first.name = 'mutated';

    const again = await runRepository(repository.get<ContractWidget>('w-1'));
    expect(again.name).toBe('Alpha');
  });

  it('pages past the end with an empty page and the real total', async () => {
    const repository = makeStaticRepository(ContractWidget, [
      makeContractWidget('w-1', 'Alpha', 10),
    ]);
    const page = await runRepository(
      repository.load<ContractWidget>({ page: 9, pageSize: 10 }),
    );
    expect(page.items).toEqual([]);
    expect(page.total).toBe(1);
  });

  it('defaults to the first page of ten, as the Mongo adapter does', async () => {
    const many = Array.from({ length: 12 }, (_, index) =>
      makeContractWidget(`w-${index}`, `Widget ${index}`, index),
    );
    const page = await runRepository(
      makeStaticRepository(ContractWidget, many).load<ContractWidget>({}),
    );
    expect(page.items).toHaveLength(10);
    expect(page.total).toBe(12);
  });
});
