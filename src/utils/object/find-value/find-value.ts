function findSingleKey<T>(source: unknown, key: string): T | undefined {
  const value = (source as Record<string, unknown>)[key];

  if (value instanceof Function) {
    return value() as T;
  }

  return value as T;
}

export function findValue<T>(
  source: unknown,
  key: string | string[],
): T | undefined {
  if (source == null) return undefined;

  if (key instanceof Array) {
    let value: T | undefined = undefined;
    for (let k of key) {
      value = findSingleKey<T>(source, k);
      if (value != null) break;
    }
    return value;
  } else return findSingleKey<T>(source, key);
}
