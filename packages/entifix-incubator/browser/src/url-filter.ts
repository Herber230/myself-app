import type { Entity, EntityPage } from '@entifix/core';
import { useCallback, useMemo } from 'react';

import type { EntitySource } from './static-json-source.js';
import type { UrlQuery, UrlState } from './url-query.js';
import { useUrlState } from './url-state.js';
import { type EntityLoad, useEntityLoad } from './use-entity-load.js';

/** A filter kept in the URL, and the records its answer keeps (entifix#41). */
export interface UrlFilter<TKey extends string, TEntity extends Entity> {
  /**
   * The state the URL holds, or `null` in the static HTML and during
   * hydration, which show every record and no controls.
   */
  readonly filter: UrlState<TKey> | null;
  /** Whether any parameter is set. */
  readonly filtering: boolean;
  /**
   * The ids the latest answer keeps, or `undefined` while every record is
   * shown. While a new answer loads, the last one stays.
   */
  readonly kept: ReadonlySet<string> | undefined;
  /** The load itself, for a page that shows its status. */
  readonly load: EntityLoad<TEntity>;
  /** Adds a value to a parameter, or takes it out when it is there. */
  toggle(key: TKey, value: string): void;
  /** Replaces a parameter's values: a search box's text. */
  set(key: TKey, values: readonly string[]): void;
  /** Every parameter emptied: no filter at all. */
  clear(): void;
}

/** `values` with `value` added, or taken out when it is already there. */
function toggled(values: readonly string[], value: string): string[] {
  return values.includes(value)
    ? values.filter(each => each !== value)
    : [...values, value];
}

/** The page an answer shows: the last one while the next is on its way. */
function shownPage<TEntity extends Entity>(
  load: EntityLoad<TEntity>,
): EntityPage<TEntity> | undefined {
  if (load.status === 'done') return load.page;
  if (load.status === 'pending') return load.previous;
  return undefined;
}

/**
 * A page's filter, from the query string to the ids it keeps (ADR 0016,
 * 0018): `useUrlState` reads and writes the parameters, and `useEntityLoad`
 * answers them through the `load` use case over `source`. The page only lays
 * out its controls, and shows or dims what `kept` names.
 */
export function useUrlFilter<
  TKey extends string,
  TContext,
  TEntity extends Entity,
>(
  source: EntitySource,
  query: UrlQuery<TKey, TContext>,
  context: TContext,
): UrlFilter<TKey, TEntity> {
  const [filter, write] = useUrlState(query);
  const filtering = filter !== null && !query.isEmpty(filter);
  const load = useEntityLoad<TEntity>(
    source,
    filtering ? query.request<TEntity>(filter, context) : null,
  );
  const page = shownPage(load);
  const kept = useMemo(
    () =>
      page === undefined
        ? undefined
        : new Set(page.items.map(record => String(record.id))),
    [page],
  );

  const set = useCallback(
    (key: TKey, values: readonly string[]) => {
      if (filter !== null) write({ ...filter, [key]: values });
    },
    [filter, write],
  );
  const toggle = useCallback(
    (key: TKey, value: string) => {
      if (filter !== null) set(key, toggled(filter[key], value));
    },
    [filter, set],
  );
  const clear = useCallback(() => write(query.empty), [query, write]);

  return { filter, filtering, kept, load, toggle, set, clear };
}
