/**
 * The same keys as `T`, every leaf a string.
 *
 * A locale's catalog is declared `satisfies CatalogShape<typeof en>`, and
 * `satisfies` checks an object literal both ways: a key missing from it and a
 * key only it has are each a type error — which `next build` fails on, because
 * it type-checks the app.
 */
export type CatalogShape<T> = {
  readonly [K in keyof T]: T[K] extends string ? string : CatalogShape<T[K]>;
};
