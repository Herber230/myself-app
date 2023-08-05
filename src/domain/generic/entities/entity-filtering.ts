export enum FilterValueOperator {
  eq = 'eq',
  ne = 'ne',
  gt = 'gt',
  gte = 'gte',
  lt = 'lt',
  lte = 'lte',
}

type FilterValue<TEntity, TKey extends keyof TEntity> = {
  property: TKey;
  operator: FilterValueOperator;
  value: TEntity[TKey];
};

export enum FilterValueArrayOperator {
  in = 'in',
  nin = 'nin',
}

type FilterValueArray<TEntity, TKey extends keyof TEntity> = {
  property: TKey;
  operator: FilterValueArrayOperator;
  value: Array<TEntity[TKey]>;
};

export enum FilterValueRangeOperator {
  between = 'between',
  nbetween = 'nbetween',
}

type FilterValueRange<TEntity, TKey extends keyof TEntity> = {
  property: TKey;
  operator: FilterValueRangeOperator;
  start: TEntity[TKey];
  end: TEntity[TKey];
};

export enum FilterValueStringOperator {
  like = 'like',
  nlike = 'nlike',
}

type FilterValueString<TEntity> = {
  property: keyof TEntity;
  operator: FilterValueStringOperator;
  value: string;
};

export enum FilterValueNullOperator {
  isNull = 'isNull',
  isNotNull = 'isNotNull',
}

type FilterValueNull<TEntity, TKey extends keyof TEntity> = {
  property: TKey;
  operator: FilterValueNullOperator;
};

export type Filter<TEntity> =
  | FilterValue<TEntity, keyof TEntity>
  | FilterValueArray<TEntity, keyof TEntity>
  | FilterValueRange<TEntity, keyof TEntity>
  | FilterValueString<TEntity>
  | FilterValueNull<TEntity, keyof TEntity>;

export type Filters<TEntity> = Array<Filter<TEntity>>;
