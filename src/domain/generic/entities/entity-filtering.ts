export const FILTER_VALUE_OPERATORS = [
  'eq',
  'ne',
  'gt',
  'gte',
  'lt',
  'lte',
] as const;
export type FilterValueOperator = (typeof FILTER_VALUE_OPERATORS)[number];
export type FilterValue<TEntity, TKey extends keyof TEntity> = {
  property: TKey;
  operator: FilterValueOperator;
  value: TEntity[TKey];
};

export const FILTER_VALUE_ARRAY_OPERATORS = ['in', 'nin'] as const;
export type FilterValueArrayOperator =
  (typeof FILTER_VALUE_ARRAY_OPERATORS)[number];
export type FilterValueArray<TEntity, TKey extends keyof TEntity> = {
  property: TKey;
  operator: FilterValueArrayOperator;
  value: Array<TEntity[TKey]>;
};

export const FILTER_VALUE_RANGE_OPERATORS = ['between', 'nbetween'] as const;
export type FilterValueRangeOperator =
  (typeof FILTER_VALUE_RANGE_OPERATORS)[number];
export type FilterValueRange<TEntity, TKey extends keyof TEntity> = {
  property: TKey;
  operator: FilterValueRangeOperator;
  start: TEntity[TKey];
  end: TEntity[TKey];
};

export const FILTER_VALUE_STRING_OPERATORS = ['like', 'nlike'] as const;
export type FilterValueStringOperator =
  (typeof FILTER_VALUE_STRING_OPERATORS)[number];
export type FilterValueString<TEntity> = {
  property: keyof TEntity;
  operator: FilterValueStringOperator;
  value: string;
};

export const FILTER_VALUE_NULL_OPERATORS = ['isNull', 'isNotNull'] as const;
export type FilterValueNullOperator =
  (typeof FILTER_VALUE_NULL_OPERATORS)[number];
export type FilterValueNull<TEntity, TKey extends keyof TEntity> = {
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
