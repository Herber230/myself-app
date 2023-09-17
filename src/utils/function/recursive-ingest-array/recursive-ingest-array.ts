export function recursiveIngestArray<TSource, TParams extends unknown[]>(
  source: unknown,
  ...params: TParams
): Promise<Array<TSource>> {
  if (source == null) return Promise.resolve([]);

  if (source instanceof Array) return Promise.resolve(source);

  if (source instanceof Promise) return source;

  if (typeof source === 'function')
    return recursiveIngestArray(source(...params), ...params);

  return Promise.reject(new Error('Invalid collection source'));
}
