/**
 * What the page renders. Two properties matter beyond "it ran": the layout is
 * the same on every build — otherwise every export is a diff and a screenshot
 * test is noise — and no blip sits in the wrong segment or on top of another.
 */
import { describe, expect, it } from 'vitest';

import { SITE_LOCALES } from '../../site-locales';
import {
  BLIP_RADIUS,
  CENTRE_RADIUS,
  polar,
  QUADRANT_SECTORS,
  RING_RADII,
} from './geometry';
import { layoutRadar } from './layout';
import { MOCK_RADAR_ENTRIES } from './mock-entries';
import type { QuadrantIndex, RadarEntry, RingIndex } from './types';

function entry(
  id: string,
  quadrant: QuadrantIndex,
  ring: RingIndex,
  label = id,
): RadarEntry {
  return {
    id,
    label: { en: label, es: label },
    quadrant,
    ring,
    movement: 'none',
  };
}

/** The distance between the two blips that ended up nearest each other. */
function closest(blips: readonly { x: number; y: number }[]) {
  let nearest = Infinity;
  for (const [index, a] of blips.entries()) {
    for (const b of blips.slice(index + 1)) {
      nearest = Math.min(nearest, Math.hypot(b.x - a.x, b.y - a.y));
    }
  }
  return nearest;
}

describe('a radar layout', () => {
  const layout = layoutRadar(MOCK_RADAR_ENTRIES);

  it('places every entry exactly once', () => {
    // Pinned: the mock radar covers all sixteen segments.
    expect(MOCK_RADAR_ENTRIES.length).toBeGreaterThanOrEqual(16);
    expect(layout.blips).toHaveLength(MOCK_RADAR_ENTRIES.length);
    expect(new Set(layout.blips.map(blip => blip.id)).size).toBe(
      MOCK_RADAR_ENTRIES.length,
    );
  });

  it('repeats itself, so two builds export the same radar', () => {
    expect(layoutRadar(MOCK_RADAR_ENTRIES)).toEqual(layout);
  });

  it('moves every blip when the seed changes', () => {
    const other = layoutRadar(MOCK_RADAR_ENTRIES, { seed: 7 });
    for (const [index, blip] of other.blips.entries()) {
      expect(blip.id, blip.id).toBe(layout.blips[index].id);
      expect(
        blip.x !== layout.blips[index].x || blip.y !== layout.blips[index].y,
        blip.id,
      ).toBe(true);
    }
  });

  it('keeps each blip inside its own quadrant and ring', () => {
    for (const blip of layout.blips) {
      const sector = QUADRANT_SECTORS[blip.quadrant];
      const inner = blip.ring === 0 ? CENTRE_RADIUS : RING_RADII[blip.ring - 1];
      const { r } = polar(blip);
      expect(r, blip.id).toBeGreaterThanOrEqual(inner);
      expect(r, blip.id).toBeLessThanOrEqual(RING_RADII[blip.ring]);
      expect(Math.sign(blip.x) || sector.factorX, blip.id).toBe(sector.factorX);
      expect(Math.sign(blip.y) || sector.factorY, blip.id).toBe(sector.factorY);
    }
  });

  it('leaves no two blips overlapping', () => {
    expect(closest(layout.blips)).toBeGreaterThanOrEqual(2 * BLIP_RADIUS);
  });

  it('reports the geometry the renderer draws from', () => {
    expect(layout.ringRadii).toEqual(RING_RADII);
    expect(layout.extent).toBe(RING_RADII[RING_RADII.length - 1]);
  });
});

describe('a blip number', () => {
  it('runs from one, without a gap', () => {
    const { blips } = layoutRadar(MOCK_RADAR_ENTRIES);
    expect(blips.map(blip => blip.number).sort((a, b) => a - b)).toEqual(
      MOCK_RADAR_ENTRIES.map((_, index) => index + 1),
    );
  });

  it('counts by quadrant in the reference radar order, then outwards, then by name', () => {
    const entries = [
      entry('q0-adopt-b', 0, 0, 'Beta'),
      entry('q0-adopt-a', 0, 0, 'Alpha'),
      entry('q0-hold', 0, 3),
      entry('q1-adopt', 1, 0),
      entry('q2-adopt', 2, 0),
      entry('q3-trial', 3, 1),
    ];
    const numbers = Object.fromEntries(
      layoutRadar(entries).blips.map(blip => [blip.id, blip.number]),
    );
    expect(numbers).toEqual({
      'q2-adopt': 1,
      'q3-trial': 2,
      'q1-adopt': 3,
      'q0-adopt-a': 4,
      'q0-adopt-b': 5,
      'q0-hold': 6,
    });
  });

  it('does not depend on the locale the page is read in', () => {
    const numbersByLocale = SITE_LOCALES.map(locale =>
      layoutRadar(MOCK_RADAR_ENTRIES)
        .blips.map(blip => `${blip.number}:${blip.label[locale]}`)
        .map(pair => pair.split(':')[0]),
    );
    expect(numbersByLocale[0]).toEqual(numbersByLocale[1]);
  });
});

describe('an empty or crowded radar', () => {
  const crowd = (size: number) =>
    Array.from({ length: size }, (_, index) =>
      entry(`blip-${index}`, 0, 0, `Blip ${index}`),
    );

  it('lays out nothing at all', () => {
    expect(layoutRadar([]).blips).toEqual([]);
  });

  it('pushes apart blips that landed on top of each other', () => {
    // The innermost segment is the smallest, so twelve blips land overlapping
    // and the relaxation has work to do — the mock radar alone never collides.
    const entries = crowd(12);
    const untouched = closest(layoutRadar(entries, { passes: 0 }).blips);
    const relaxed = closest(layoutRadar(entries).blips);
    expect(untouched).toBeLessThan(2 * BLIP_RADIUS);
    expect(relaxed).toBeGreaterThan(untouched);
    expect(relaxed).toBeCloseTo(2 * BLIP_RADIUS, 4);
  });

  it('settles a segment packed past what it can hold, without looping forever', () => {
    const { blips } = layoutRadar(crowd(40));
    expect(blips).toHaveLength(40);
    for (const blip of blips) {
      const { r } = polar(blip);
      expect(Number.isFinite(blip.x) && Number.isFinite(blip.y), blip.id).toBe(
        true,
      );
      expect(r, blip.id).toBeGreaterThanOrEqual(CENTRE_RADIUS);
      expect(r, blip.id).toBeLessThanOrEqual(RING_RADII[0]);
    }
  });

  it('refuses an entry outside the four quadrants and rings', () => {
    const stray = {
      ...entry('stray', 0, 0),
      quadrant: 9,
    } as unknown as RadarEntry;
    expect(() => layoutRadar([stray])).toThrow(RangeError);
  });
});
