import { describe, expect, it } from 'vitest';

import { SITE_REPOSITORIES } from './repositories';
import { loadTechnologyDetail } from './technology-detail';

const detailOf = (id: string) => loadTechnologyDetail(SITE_REPOSITORIES, id);

describe("a technology's detail", () => {
  it('carries its ring history, oldest first', async () => {
    const detail = await detailOf('jest');
    expect(detail?.technology.id).toBe('jest');
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

  it('carries its quadrant and the ring it sits in now', async () => {
    const detail = await detailOf('static-first-delivery');
    expect(detail?.quadrant.id).toBe('techniques');
    expect(detail?.ring.id).toBe('trial');
  });

  it('carries its areas, in the order it lists them', async () => {
    const detail = await detailOf('static-first-delivery');
    expect(detail?.areas.map(area => area.id)).toEqual([
      'web-rendering',
      'delivery',
    ]);
  });

  it('lists every project that uses it, in their order', async () => {
    const detail = await detailOf('typescript');
    expect(detail?.projects.map(project => project.id)).toEqual([
      'myself-app',
      'entifix',
    ]);
  });

  it('lists no project for a technology none uses', async () => {
    const detail = await detailOf('spring-boot');
    expect(detail?.projects).toEqual([]);
  });

  it('is undefined for an id that names no technology', async () => {
    expect(await detailOf('cobol')).toBeUndefined();
  });
});
