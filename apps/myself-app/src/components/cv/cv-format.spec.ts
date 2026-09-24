import { describe, expect, it } from 'vitest';

import {
  CV_MODES,
  formatMonth,
  formatPeriod,
  formatYears,
  readableUrl,
} from './cv-format';

const day = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

describe('a CV date', () => {
  it('is a short month and a year, in the reader’s language', () => {
    expect(formatMonth(day('2022-01-01'), 'en')).toBe('Jan 2022');
    expect(formatMonth(day('2022-01-01'), 'es')).toBe('ene 2022');
  });

  it('keeps the calendar day, whatever the machine’s time zone', () => {
    // Midnight UTC on the 1st is the 31st of the month before, west of UTC.
    expect(formatMonth(day('2020-11-01'), 'en')).toBe('Nov 2020');
  });

  it('runs to the present for a period with no end', () => {
    expect(formatPeriod(day('2022-01-01'), undefined, 'en', 'Present')).toBe(
      'Jan 2022 – Present',
    );
    expect(
      formatPeriod(day('2019-04-01'), day('2020-10-31'), 'es', 'Actualidad'),
    ).toBe('abr 2019 – oct 2020');
  });

  it('is a span of years for studies, or one year', () => {
    expect(formatYears(day('2007-01-01'), day('2014-12-31'))).toBe(
      '2007 – 2014',
    );
    expect(formatYears(day('2017-01-01'), day('2017-06-30'))).toBe('2017');
    expect(formatYears(day('2016-01-01'), undefined)).toBe('2016');
  });
});

describe('a CV link, as text', () => {
  it('is what a reader would type', () => {
    expect(readableUrl('https://www.linkedin.com/in/herbercolop/')).toBe(
      'linkedin.com/in/herbercolop',
    );
    expect(readableUrl('https://github.com/Herber230')).toBe(
      'github.com/Herber230',
    );
    expect(readableUrl('mailto:herbercolop@gmail.com')).toBe(
      'herbercolop@gmail.com',
    );
  });
});

describe('the modes', () => {
  it('are human first, then ATS', () => {
    expect(CV_MODES).toEqual(['human', 'ats']);
  });
});
