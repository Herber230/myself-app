/*
 * Derived from zalando/tech-radar, `docs/radar.js` (the quadrant and ring
 * tables and the `polar`/`cartesian`/`bounded_*`/`segment` helpers, lines
 * 65-152).
 *
 * The MIT License (MIT)
 * Copyright (c) 2017-2024 Zalando SE
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
import type { SeededRandom } from './random';
import type { Point, PolarPoint, QuadrantIndex, RingIndex } from './types';

/** Outer radius of each ring, innermost first. The radar's unit of length. */
export const RING_RADII = [130, 220, 310, 400] as const;

/** No blip sits closer to the centre than this: the middle is the axis cross. */
export const CENTRE_RADIUS = 30;

/** Half a blip. Also the collision radius the relaxation keeps between two. */
export const BLIP_RADIUS = 12;

/** Kept clear inside a segment's edges, so a blip never straddles a ring. */
const SEGMENT_PADDING = 15;

/**
 * The four quadrants as angular sectors. `radialMin`/`radialMax` are multiples
 * of π; `factorX`/`factorY` are the signs of the quadrant's corner, which is
 * what bounds a blip to its half-plane. Note SVG's y grows downwards, so
 * quadrant 0 (`+x`, `+y`) draws bottom right — Zalando's numbering.
 */
export const QUADRANT_SECTORS = [
  { radialMin: 0, radialMax: 0.5, factorX: 1, factorY: 1 },
  { radialMin: 0.5, radialMax: 1, factorX: -1, factorY: 1 },
  { radialMin: -1, radialMax: -0.5, factorX: -1, factorY: -1 },
  { radialMin: -0.5, radialMax: 0, factorX: 1, factorY: -1 },
] as const;

export const QUADRANT_INDICES: readonly QuadrantIndex[] = [0, 1, 2, 3];
export const RING_INDICES: readonly RingIndex[] = [0, 1, 2, 3];

export function polar({ x, y }: Point): PolarPoint {
  return { t: Math.atan2(y, x), r: Math.sqrt(x * x + y * y) };
}

export function cartesian({ t, r }: PolarPoint): Point {
  return { x: r * Math.cos(t), y: r * Math.sin(t) };
}

/** Clamps to the interval, whichever way round its ends are given. */
export function boundedInterval(value: number, min: number, max: number) {
  const low = Math.min(min, max);
  const high = Math.max(min, max);
  return Math.min(Math.max(value, low), high);
}

/** Clamps the radius, keeping the angle: pulls a point into its ring. */
export function boundedRing(point: PolarPoint, rMin: number, rMax: number) {
  return { t: point.t, r: boundedInterval(point.r, rMin, rMax) };
}

/** Clamps both axes: pulls a point into its quadrant. */
export function boundedBox(point: Point, min: Point, max: Point): Point {
  return {
    x: boundedInterval(point.x, min.x, max.x),
    y: boundedInterval(point.y, min.y, max.y),
  };
}

export interface Segment {
  /** Pulls a point back inside this quadrant *and* this ring. */
  clip(point: Point): Point;
  /** A point somewhere inside, biased towards the middle of the ring. */
  randomPoint(random: SeededRandom): Point;
}

/**
 * One of the sixteen cells of the radar. Both bounds matter: the box keeps a
 * blip in its quadrant (an angular clamp alone would jump the ±π seam), and
 * the ring keeps it between two radii.
 */
export function segment(quadrant: QuadrantIndex, ring: RingIndex): Segment {
  const sector = QUADRANT_SECTORS[quadrant];
  const polarMin = {
    t: sector.radialMin * Math.PI,
    r: ring === 0 ? CENTRE_RADIUS : RING_RADII[ring - 1],
  };
  const polarMax = { t: sector.radialMax * Math.PI, r: RING_RADII[ring] };
  const boxMin = {
    x: SEGMENT_PADDING * sector.factorX,
    y: SEGMENT_PADDING * sector.factorY,
  };
  const boxMax = {
    x: RING_RADII[RING_RADII.length - 1] * sector.factorX,
    y: RING_RADII[RING_RADII.length - 1] * sector.factorY,
  };
  return {
    clip: point =>
      cartesian(
        boundedRing(
          polar(boundedBox(point, boxMin, boxMax)),
          polarMin.r + SEGMENT_PADDING,
          polarMax.r - SEGMENT_PADDING,
        ),
      ),
    randomPoint: random =>
      cartesian({
        t: random.between(polarMin.t, polarMax.t),
        r: random.normalBetween(polarMin.r, polarMax.r),
      }),
  };
}
