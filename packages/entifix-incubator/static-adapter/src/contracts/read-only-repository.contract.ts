/**
 * The read half of entifix's repository contract.
 *
 * ⚠️ It is re-created here because entifix has no read half to import.
 * `describeEntityRepositoryContract` is one suite of seventeen cases with no
 * split and no flag, six of which save or delete — which a read-only adapter
 * refuses by design. entifix#37 lists the split as the work that follows this
 * adapter's promotion, and when it lands this file is a delete.
 *
 * The fixture is entifix's own — `ContractWidget`, `makeContractWidget` — so
 * both implementations are still held to the same entity, and the cases below
 * are the eleven read cases of that suite, assertion for assertion.
 */
import type { EntityRepository } from '@entifix/business';
import { runRepository, runRepositoryExit } from '@entifix/testing-unit';
import {
  ContractWidget,
  makeContractWidget,
} from '@entifix/testing-unit/contracts';
import { Exit } from 'effect';
import { describe, expect, it } from 'vitest';

export interface ReadOnlyRepositoryContractOptions {
  makeRepository(
    seed: ContractWidget[],
  ): EntityRepository | Promise<EntityRepository>;
}

export const describeReadOnlyEntityRepositoryContract = (
  name: string,
  { makeRepository }: ReadOnlyRepositoryContractOptions,
): void => {
  describe(`${name}: the read half of the repository contract`, () => {
    const seeded = () => [
      makeContractWidget('w-1', 'Alpha', 10),
      makeContractWidget('w-2', 'Beta', 20),
      makeContractWidget('w-3', 'Gamma', 30),
    ];

    /** A fresh repository per case, as entifix's own suite builds one. */
    const repository = (seed: ContractWidget[] = seeded()) =>
      Promise.resolve(makeRepository(seed));

    it('keeps a record unchanged when a read instance is mutated', async () => {
      const subject = await repository();
      const loaded = await runRepository(subject.load<ContractWidget>({}));
      loaded.items[0].name = 'mutated';

      const again = await runRepository(subject.load<ContractWidget>({}));
      expect(again.items.map(widget => widget.name)).toEqual([
        'Alpha',
        'Beta',
        'Gamma',
      ]);
    });

    it('loads every stored entity with its total', async () => {
      const subject = await repository();
      const page = await runRepository(subject.load<ContractWidget>({}));
      expect(page.items).toHaveLength(3);
      expect(page.total).toBe(3);
    });

    it('echoes the request it served on the page', async () => {
      const subject = await repository();
      const request = { page: 1, pageSize: 2 };
      const page = await runRepository(subject.load<ContractWidget>(request));
      expect(page.request).toEqual(request);
    });

    it('pages with a 1-based page number', async () => {
      const subject = await repository();
      const page = await runRepository(
        subject.load<ContractWidget>({ page: 2, pageSize: 2 }),
      );
      expect(page.items).toHaveLength(1);
      expect(page.total).toBe(3);
    });

    it('filters by an equality operator', async () => {
      const subject = await repository();
      const page = await runRepository(
        subject.load<ContractWidget>({
          filtering: [{ property: 'name', operator: 'eq', value: 'Beta' }],
        }),
      );
      expect(page.items.map(widget => widget.id)).toEqual(['w-2']);
    });

    it('filters by a range operator', async () => {
      const subject = await repository();
      const page = await runRepository(
        subject.load<ContractWidget>({
          filtering: [
            { property: 'size', operator: 'between', start: 15, end: 35 },
          ],
        }),
      );
      expect(page.items.map(widget => widget.id)).toEqual(['w-2', 'w-3']);
    });

    it('matches like case-insensitively on a substring', async () => {
      const subject = await repository();
      const page = await runRepository(
        subject.load<ContractWidget>({
          filtering: [{ property: 'name', operator: 'like', value: 'et' }],
        }),
      );
      expect(page.items.map(widget => widget.id)).toEqual(['w-2']);
    });

    it('sorts descending when asked to', async () => {
      const subject = await repository();
      const page = await runRepository(
        subject.load<ContractWidget>({
          sorting: [{ 0: { property: 'size', type: 'desc' } }],
        }),
      );
      expect(page.items.map(widget => widget.id)).toEqual([
        'w-3',
        'w-2',
        'w-1',
      ]);
    });

    it('reads a single entity by id', async () => {
      const subject = await repository();
      const widget = await runRepository(subject.get<ContractWidget>('w-2'));
      expect(widget.name).toBe('Beta');
    });

    it('fails rather than resolving undefined for an unknown id', async () => {
      const subject = await repository();
      const exit = await runRepositoryExit(
        subject.get<ContractWidget>('missing'),
      );
      expect(Exit.isFailure(exit)).toBe(true);
    });

    it('loads an empty page from an empty store', async () => {
      const subject = await repository([]);
      const page = await runRepository(subject.load<ContractWidget>({}));
      expect(page.items).toEqual([]);
      expect(page.total).toBe(0);
    });
  });
};
