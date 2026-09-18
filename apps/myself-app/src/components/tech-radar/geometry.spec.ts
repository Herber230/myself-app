/**
 * The maths the renderer trusts. A blip outside its segment is the failure
 * these tests exist to catch: nothing in the SVG reports it, and the picture
 * simply lies about where a technology sits.
 */
import { describe, expect, it } from 'vitest';

import {
  boundedBox,
  boundedInterval,
  boundedRing,
  cartesian,
  CENTRE_RADIUS,
  polar,
  QUADRANT_INDICES,
  QUADRANT_SECTORS,
  RING_INDICES,
  RING_RADII,
  segment,
} from './geometry';
import { createRandom } from './random';

const SEGMENT_PADDING = 15;

/** The radii a segment's points must lie between, padding included. */
function annulus(ring: number) {
  const inner = ring === 0 ? CENTRE_RADIUS : RING_RADII[ring - 1];
  return {
    min: inner + SEGMENT_PADDING,
    max: RING_RADII[ring] - SEGMENT_PADDING,
  };
}

describe('the radar rings', () => {
  it('are four, growing outwards from the centre cross', () => {
    expect(RING_RADII).toEqual([130, 220, 310, 400]);
    expect(CENTRE_RADIUS).toBeLessThan(RING_RADII[0]);
  });
});

describe('polar and cartesian', () => {
  it('invert each other', () => {
    for (const point of [
      { x: 100, y: 0 },
      { x: -40, y: 220 },
      { x: -300, y: -120 },
      { x: 17, y: -390 },
    ]) {
      const round = cartesian(polar(point));
      expect(round.x, `x of ${JSON.stringify(point)}`).toBeCloseTo(point.x, 9);
      expect(round.y, `y of ${JSON.stringify(point)}`).toBeCloseTo(point.y, 9);
    }
  });
});

describe('a bounded value', () => {
  it('is clamped to the interval, whichever way round its ends are given', () => {
    expect(boundedInterval(5, 0, 10)).toBe(5);
    expect(boundedInterval(-3, 0, 10)).toBe(0);
    expect(boundedInterval(42, 0, 10)).toBe(10);
    expect(boundedInterval(-3, 10, 0)).toBe(0);
  });

  it('keeps its angle when the radius is clamped', () => {
    const bounded = boundedRing({ t: 1.2, r: 500 }, 130, 220);
    expect(bounded).toEqual({ t: 1.2, r: 220 });
    expect(boundedRing({ t: 1.2, r: 10 }, 130, 220).r).toBe(130);
  });

  it('is clamped on both axes at once inside a box', () => {
    const min = { x: 15, y: 15 };
    const max = { x: 400, y: 400 };
    expect(boundedBox({ x: 800, y: -20 }, min, max)).toEqual({ x: 400, y: 15 });
    expect(boundedBox({ x: 100, y: 100 }, min, max)).toEqual({
      x: 100,
      y: 100,
    });
  });
});

describe('a radar segment', () => {
  it('draws its random points inside its own quadrant and ring', () => {
    const random = createRandom(11);
    for (const quadrant of QUADRANT_INDICES) {
      for (const ring of RING_INDICES) {
        const sector = QUADRANT_SECTORS[quadrant];
        const cell = segment(quadrant, ring);
        for (let draw = 0; draw < 200; draw++) {
          const where = `quadrant ${quadrant}, ring ${ring}, draw ${draw}`;
          const point = cell.randomPoint(random);
          const { r } = polar(point);
          const inner = ring === 0 ? CENTRE_RADIUS : RING_RADII[ring - 1];
          expect(r, where).toBeGreaterThanOrEqual(inner);
          expect(r, where).toBeLessThanOrEqual(RING_RADII[ring]);
          expect(Math.sign(point.x) || sector.factorX, where).toBe(
            sector.factorX,
          );
          expect(Math.sign(point.y) || sector.factorY, where).toBe(
            sector.factorY,
          );
        }
      }
    }
  });

  it('pulls a point outside the radar back into its segment', () => {
    for (const quadrant of QUADRANT_INDICES) {
      for (const ring of RING_INDICES) {
        const sector = QUADRANT_SECTORS[quadrant];
        const cell = segment(quadrant, ring);
        const bounds = annulus(ring);
        for (const stray of [
          { x: 5000, y: 5000 },
          { x: -5000, y: -5000 },
          { x: 0, y: 0 },
          { x: 1, y: -1 },
        ]) {
          const where = `quadrant ${quadrant}, ring ${ring}, ${JSON.stringify(stray)}`;
          const clipped = cell.clip(stray);
          const { r } = polar(clipped);
          expect(r, where).toBeGreaterThanOrEqual(bounds.min - 1e-9);
          expect(r, where).toBeLessThanOrEqual(bounds.max + 1e-9);
          expect(Math.sign(clipped.x) || sector.factorX, where).toBe(
            sector.factorX,
          );
          expect(Math.sign(clipped.y) || sector.factorY, where).toBe(
            sector.factorY,
          );
        }
      }
    }
  });

  it('leaves a point that is already well inside where it is', () => {
    const cell = segment(0, 1);
    const inside = cartesian({ t: Math.PI / 4, r: 175 });
    const clipped = cell.clip(inside);
    expect(clipped.x).toBeCloseTo(inside.x, 9);
    expect(clipped.y).toBeCloseTo(inside.y, 9);
  });
});
