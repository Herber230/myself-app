import { describe, expect, it } from 'vitest';

import { decisionQuery, sortChoiceOf, sortValueOf } from './decision-query.js';

const query = decisionQuery({
  statuses: ['accepted', 'superseded-in-part'],
  areas: ['data', 'ui'],
});

describe('the decision records’ query', () => {
  it('keeps the statuses and areas there are, and one sort it knows', () => {
    expect(
      query.parse('?status=accepted&status=gone&area=ui&sort=date-desc&sort=x'),
    ).toEqual({
      status: ['accepted'],
      area: ['ui'],
      q: [],
      sort: ['date-desc'],
    });
    expect(query.parse('?sort=colour-asc').sort).toEqual([]);
  });

  it('searches the title and the read-when line alike', () => {
    expect(query.request(query.parse('?q=%20bundle%20'), undefined)).toEqual({
      filtering: [
        {
          operator: 'or',
          values: [
            { property: 'title', operator: 'like', value: 'bundle' },
            { property: 'readWhen', operator: 'like', value: 'bundle' },
          ],
        },
      ],
      sorting: [{ 0: { property: 'number', type: 'asc' } }],
    });
  });

  it('orders by the sort chosen', () => {
    expect(
      query.request(query.parse('?sort=title-desc'), undefined).sorting,
    ).toEqual([{ 0: { property: 'title', type: 'desc' } }]);
  });
});

describe('a sort in the URL', () => {
  it('reads back as the field and direction it was written from', () => {
    expect(sortChoiceOf('date-desc')).toEqual({
      field: 'date',
      direction: 'desc',
    });
    expect(sortValueOf({ field: 'number', direction: 'asc' })).toBe(
      'number-asc',
    );
    expect(sortChoiceOf(undefined)).toBeUndefined();
  });
});
