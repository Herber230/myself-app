import { describe, expect, it } from 'vitest';

import { fixtureContent } from '../content.fixture.js';
import { loadCareer } from './load-career.uc.js';

describe('the career', () => {
  it('starts with the first employment and is at the open one', async () => {
    const career = await loadCareer(fixtureContent());
    expect(career.since).toEqual(new Date('2015-01-01'));
    expect(career.current?.period.id).toBe('globex-architect');
    expect(career.current?.employer.name).toBe('Globex');
  });

  it('has no current employment when every one has ended', async () => {
    const career = await loadCareer(
      fixtureContent({
        'employment-periods.json': [
          {
            id: 'acme-engineer',
            employer: 'acme',
            role: { en: 'Engineer', es: 'Ingeniero' },
            responsibilities: { en: 'Engines.', es: 'Motores.' },
            start: '2015-01-01',
            end: '2019-12-31',
          },
          {
            id: 'globex-architect',
            employer: 'globex',
            role: { en: 'Architect', es: 'Arquitecto' },
            responsibilities: { en: 'Plans.', es: 'Planes.' },
            start: '2020-01-01',
            end: '2024-12-31',
          },
        ],
      }),
    );
    expect(career).toEqual({
      since: new Date('2015-01-01'),
      current: undefined,
    });
  });

  it('has nothing to say without an employment', async () => {
    const career = await loadCareer(
      fixtureContent({
        'employment-periods.json': [],
        'cv-variants.json': [],
        'employment-highlights.json': [],
      }),
    );
    expect(career).toEqual({ since: undefined, current: undefined });
  });
});
