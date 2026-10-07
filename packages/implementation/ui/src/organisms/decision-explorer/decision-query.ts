/**
 * A project's decision records, filtered and ordered in the browser (#77):
 * the parameters the query string may carry, and what each becomes in an
 * entifix load request.
 *
 * `?status=accepted&area=data&q=bundle&sort=date-desc` asks for the accepted
 * records about data whose title or read-when line holds "bundle", newest
 * first. `&adr=0016` chooses the record the pane shows, and asks nothing.
 */
import {
  anyOf,
  type Condition,
  defineUrlQuery,
  type UrlQuery,
} from '@myself-app/entifix-incubator-browser';
import type { SortChoice } from '@myself-app/entifix-incubator-react-controls';

export type DecisionParam =
  'status' | 'revised' | 'area' | 'q' | 'sort' | 'adr';

/** The fields a list of records may be ordered by, as the URL names them. */
export const SORT_FIELDS = ['number', 'date', 'title', 'status'] as const;

const sortingBy = (property: string, type: 'asc' | 'desc') => [
  { 0: { property, type } },
];

/** `number-asc`, `date-desc`…: every field, both ways. */
const SORTINGS = Object.fromEntries(
  SORT_FIELDS.flatMap(field =>
    (['asc', 'desc'] as const).map(direction => [
      `${field}-${direction}`,
      sortingBy(field, direction),
    ]),
  ),
);

/** A sort as the URL writes it, read back: `date-desc`. */
export function sortChoiceOf(
  value: string | undefined,
): SortChoice | undefined {
  if (value === undefined) return undefined;
  const cut = value.lastIndexOf('-');
  return {
    field: value.slice(0, cut),
    direction: value.slice(cut + 1) as SortChoice['direction'],
  };
}

/** A sort as the URL writes it. */
export function sortValueOf({ field, direction }: SortChoice): string {
  return `${field}-${direction}`;
}

/** The text in a record's title or its read-when line. */
function inTitleOrSymptom([value]: readonly string[]): Condition {
  const text = (value as string).trim();
  return {
    operator: 'or',
    values: [
      { property: 'title', operator: 'like', value: text },
      { property: 'readWhen', operator: 'like', value: text },
    ],
  };
}

export function decisionQuery(vocabulary: {
  readonly statuses: readonly string[];
  readonly areas: readonly string[];
  /** The project's record numbers: `0016`. */
  readonly numbers: readonly string[];
}): UrlQuery<DecisionParam, undefined> {
  return defineUrlQuery<DecisionParam>({
    params: {
      status: { allowed: vocabulary.statuses, condition: anyOf('status') },
      // Revised at least once, whatever its status: `?revised=yes`.
      revised: {
        allowed: ['yes'],
        condition: () => ({
          property: 'revisions',
          operator: 'gt',
          value: 0,
        }),
      },
      area: { allowed: vocabulary.areas, condition: anyOf('area') },
      q: { single: true, condition: inTitleOrSymptom },
      sort: { sorting: SORTINGS },
      adr: { select: true, allowed: vocabulary.numbers },
    },
    sorting: sortingBy('number', 'asc'),
  });
}
