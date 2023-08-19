export enum SortDirection {
  asc = 'asc',
  desc = 'desc',
}

export type Sorting<TEntity> = Partial<Record<keyof TEntity, SortDirection>>;
