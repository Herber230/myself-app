import { describe, expect, it } from 'vitest';

import { fixtureContent } from '../content.fixture.js';
import { loadTechnologyDetail } from './load-technology-detail.uc.js';

const detailOf = (id: string) => loadTechnologyDetail(fixtureContent(), id);

describe("a technology's detail", () => {
  it('carries its ring history, oldest first', async () => {
    const detail = await detailOf('jest');
    expect(
      detail?.history.map(stretch => ({
        ring: stretch.ring.id,
        start: stretch.start.toISOString().slice(0, 10),
        end: stretch.end?.toISOString().slice(0, 10),
      })),
    ).toEqual([
      { ring: 'adopt', start: '2017-08-01', end: '2026-01-01' },
      { ring: 'hold', start: '2026-01-01', end: undefined },
    ]);
  });

  it('carries its quadrant, its ring now and its areas in their order', async () => {
    const detail = await detailOf('typescript');
    expect(detail?.technology.id).toBe('typescript');
    expect(detail?.quadrant.id).toBe('tools');
    expect(detail?.ring.id).toBe('adopt');
    expect(detail?.areas.map(area => area.id)).toEqual(['web', 'quality']);
  });

  it('lists every project that uses it, featured or not, in their order', async () => {
    expect((await detailOf('typescript'))?.projects.map(p => p.id)).toEqual([
      'library',
      'engine',
    ]);
    expect((await detailOf('jest'))?.projects.map(p => p.id)).toEqual([
      'side-project',
    ]);
  });

  it('is undefined for an id that names no technology', async () => {
    expect(await detailOf('cobol')).toBeUndefined();
  });
});
