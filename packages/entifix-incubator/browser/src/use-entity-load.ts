import type { Entity, EntityLoadRequest, EntityPage } from '@entifix/core';
import { loadThroughUseCase } from '@myself-app/entifix-incubator-static-adapter';
import { useEffect, useState } from 'react';

import type { EntitySource } from './static-json-source.js';

export type EntityLoad<TEntity extends Entity> =
  | { readonly status: 'idle' }
  /**
   * Waiting for an answer. `previous` is the last answer from the same
   * source, so a filter being changed keeps showing what it showed.
   */
  | { readonly status: 'pending'; readonly previous?: EntityPage<TEntity> }
  | { readonly status: 'done'; readonly page: EntityPage<TEntity> }
  | { readonly status: 'failed'; readonly error: unknown };

const IDLE = { status: 'idle' } as const;

/** Every record one request can reach: a filter never pages. */
const EVERY_RECORD = Number.MAX_SAFE_INTEGER;

interface Answer<TEntity extends Entity> {
  readonly source: EntitySource;
  readonly key: string;
  readonly load: EntityLoad<TEntity>;
}

/**
 * The records a request selects, through the `load` use case over a source.
 *
 * `null` asks for nothing and answers `idle`: before hydration, and while no
 * filter is set, the page shows what the build rendered. An answer counts only
 * for the request it was asked for, so a late answer to an older filter is
 * never shown as the current one.
 */
export function useEntityLoad<TEntity extends Entity>(
  source: EntitySource,
  request: EntityLoadRequest<TEntity> | null,
): EntityLoad<TEntity> {
  const [answer, setAnswer] = useState<Answer<TEntity>>();
  // Requests are rebuilt on every render; their content is what changes.
  const key = request === null ? null : JSON.stringify(request);

  useEffect(() => {
    if (request === null || key === null) return;
    const settle = (load: EntityLoad<TEntity>) =>
      setAnswer({ source, key, load });
    source()
      .then(repository =>
        loadThroughUseCase<TEntity>(repository, {
          ...request,
          page: 1,
          pageSize: EVERY_RECORD,
        }),
      )
      .then(
        page => settle({ status: 'done', page }),
        (error: unknown) => settle({ status: 'failed', error }),
      );
    // `request` is read through `key`, its content: a new object with the
    // same content is the same request.
  }, [source, key]);

  if (key === null) return IDLE;
  if (answer?.source !== source) return { status: 'pending' };
  if (answer.key === key) return answer.load;
  return answer.load.status === 'done'
    ? { status: 'pending', previous: answer.load.page }
    : { status: 'pending' };
}
