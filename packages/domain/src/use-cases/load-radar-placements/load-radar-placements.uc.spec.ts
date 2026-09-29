import { describe, expect, it } from 'vitest';

import { fixtureContent } from '../content.fixture.js';
import {
  loadEditionDate,
  loadRadarPlacements,
  movementOf,
} from './load-radar-placements.uc.js';

const at = (iso: string) => new Date(`${iso}T00:00:00.000Z`);
const EDITION = at('2026-01-01');

describe('a movement', () => {
  it('is none when it sat in the same ring at the last edition', () => {
    expect(movementOf([{ ring: 1, start: at('2023-01-01') }], EDITION)).toBe(
      'none',
    );
  });

  it('is new when it sat in no ring at the last edition', () => {
    expect(movementOf([{ ring: 2, start: at('2026-06-01') }], EDITION)).toBe(
      'new',
    );
  });

  it('is in when it moved towards the centre, and out when away', () => {
    const moved = (from: number, to: number) =>
      movementOf(
        [
          { ring: to, start: at('2026-03-01') },
          { ring: from, start: at('2023-01-01'), end: at('2026-03-01') },
        ],
        EDITION,
      );
    expect(moved(2, 1)).toBe('in');
    expect(moved(2, 3)).toBe('out');
    expect(moved(2, 2)).toBe('none');
  });

  it('is none for a technology with no period at all', () => {
    expect(movementOf([], EDITION)).toBe('none');
  });

  it('treats a period that ended exactly at the edition as over', () => {
    expect(
      movementOf([{ ring: 0, start: at('2023-01-01'), end: EDITION }], EDITION),
    ).toBe('new');
  });
});

describe('the placements', () => {
  it('compare against the latest edition in content', async () => {
    expect(await loadEditionDate(fixtureContent())).toEqual(at('2025-09-01'));
  });

  it('place every technology in its quadrant and ring', async () => {
    const placements = await loadRadarPlacements(fixtureContent());
    expect(
      placements.map(each => [
        each.technology.id,
        each.quadrant.id,
        each.ring.id,
      ]),
    ).toEqual([
      ['typescript', 'tools', 'adopt'],
      ['react', 'tools', 'trial'],
      ['jest', 'techniques', 'hold'],
    ]);
  });

  it('measure movement from the periods each spent in rings', async () => {
    const movements = new Map(
      (await loadRadarPlacements(fixtureContent())).map(each => [
        each.technology.id,
        each.movement,
      ]),
    );
    // At the 2025-09 edition Jest sat in adopt and now holds; React had
    // already arrived; TypeScript has not moved.
    expect(movements).toEqual(
      new Map([
        ['typescript', 'none'],
        ['react', 'none'],
        ['jest', 'out'],
      ]),
    );
    const earlier = fixtureContent({
      'radar-editions.json': [{ id: 'then', date: '2016-01-01' }],
    });
    const then = await loadRadarPlacements(earlier);
    expect(then.map(each => each.movement)).toEqual(['new', 'new', 'new']);
  });
});
