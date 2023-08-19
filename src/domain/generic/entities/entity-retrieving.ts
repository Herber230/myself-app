import type { Entity } from './entity-base';
import type { Filters } from './entity-filtering';
import type { Sorting } from './entity-sorting';

export interface Retrieving<TEntity extends Entity> {
  filters?: Filters<TEntity>;
  sorting?: Sorting<TEntity>;
}
