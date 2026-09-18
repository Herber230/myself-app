/*
 * Derived from zalando/tech-radar, `docs/radar.js` (the placement, numbering
 * and collision passes, lines 154-190 and 536-547). The force simulation is
 * not a port: d3's `forceCollide` jiggles coincident nodes with `Math.random`,
 * so its result differs between builds. The relaxation below does the same job
 * from the seeded generator, so two builds place every blip identically.
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
import { SITE_DEFAULT_LOCALE } from '../../site-locales';
import {
  BLIP_RADIUS,
  RING_INDICES,
  RING_RADII,
  type Segment,
  segment,
} from './geometry';
import { createRandom, DEFAULT_SEED, type SeededRandom } from './random';
import type {
  PlacedBlip,
  QuadrantIndex,
  RadarEntry,
  RadarLayout,
} from './types';

/**
 * Zalando numbers the quadrants in this order, which walks the legend columns
 * left to right in the printed layout. Kept so a reader of both radars is not
 * surprised.
 */
const NUMBERING_ORDER: readonly QuadrantIndex[] = [2, 3, 1, 0];

/** How hard an overlapping pair is pushed apart, per pass. Zalando's value. */
const RELAX_STRENGTH = 0.85;

/** Enough passes for the mock radar to settle; the loop stops early anyway. */
const RELAX_PASSES = 300;

/** Below this, two blips count as coincident and are pushed apart at random. */
const EPSILON = 1e-9;

export interface LayoutOptions {
  readonly seed?: number;
  readonly passes?: number;
  /**
   * The generator to place and separate blips with. `createRandom(seed)` unless
   * given, and a caller in the app never gives it.
   *
   * It exists for the one path a seeded generator cannot reach: two blips
   * landing on the same point, which `relax` has to separate at random. The
   * recurrence never repeats a draw, so the only way to exercise that branch is
   * to hand it a generator that does.
   */
  readonly random?: SeededRandom;
}

interface WorkingBlip {
  readonly entry: RadarEntry;
  readonly number: number;
  readonly segment: Segment;
  x: number;
  y: number;
}

/**
 * Places every entry inside its own quadrant and ring, numbers it, and pushes
 * overlapping blips apart.
 *
 * Runs during `next build` (ADR 0003): the export carries the coordinates, and
 * no part of this reaches the browser.
 */
export function layoutRadar(
  entries: readonly RadarEntry[],
  {
    seed = DEFAULT_SEED,
    passes = RELAX_PASSES,
    random = createRandom(seed),
  }: LayoutOptions = {},
): RadarLayout {
  const blips = numbered(entries).map<WorkingBlip>(({ entry, number }) => {
    const cell = segment(entry.quadrant, entry.ring);
    const point = cell.randomPoint(random);
    return { entry, number, segment: cell, x: point.x, y: point.y };
  });

  relax(blips, passes, random);

  return {
    blips: blips.map(placed),
    ringRadii: RING_RADII,
    extent: RING_RADII[RING_RADII.length - 1],
  };
}

/**
 * The 1-based number the legend repeats: by quadrant in Zalando's order, then
 * by ring outwards, then alphabetically.
 *
 * Sorted by the **default locale's** label, not the reader's: the number is
 * printed inside the blip, and a blip must not change number between the
 * English and Spanish pages.
 */
function numbered(entries: readonly RadarEntry[]) {
  const ordered: { entry: RadarEntry; number: number }[] = [];
  for (const quadrant of NUMBERING_ORDER) {
    for (const ring of RING_INDICES) {
      const cell = entries
        .filter(entry => entry.quadrant === quadrant && entry.ring === ring)
        .sort((a, b) =>
          a.label[SITE_DEFAULT_LOCALE].localeCompare(
            b.label[SITE_DEFAULT_LOCALE],
            SITE_DEFAULT_LOCALE,
          ),
        );
      for (const entry of cell) {
        ordered.push({ entry, number: ordered.length + 1 });
      }
    }
  }
  if (ordered.length !== entries.length) {
    throw new RangeError(
      'a radar entry is outside the four quadrants or rings',
    );
  }
  return ordered;
}

/**
 * Pushes overlapping pairs apart and clips every blip back into its segment,
 * once per pass — the shape of Zalando's `ticked`, without d3.
 */
function relax(
  blips: WorkingBlip[],
  passes: number,
  random: { between(min: number, max: number): number },
) {
  const minimum = 2 * BLIP_RADIUS;
  for (let pass = 0; pass < passes; pass++) {
    let collided = false;
    for (let i = 0; i < blips.length; i++) {
      for (let j = i + 1; j < blips.length; j++) {
        const a = blips[i];
        const b = blips[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distance = Math.hypot(dx, dy);
        if (distance >= minimum) continue;
        collided = true;
        const push = (minimum - distance) * 0.5 * RELAX_STRENGTH;
        // Two blips on the same point have no axis to separate along; the
        // seeded generator picks one, so the choice survives the next build.
        const angle =
          distance < EPSILON
            ? random.between(0, 2 * Math.PI)
            : Math.atan2(dy, dx);
        const stepX = Math.cos(angle) * push;
        const stepY = Math.sin(angle) * push;
        a.x -= stepX;
        a.y -= stepY;
        b.x += stepX;
        b.y += stepY;
      }
    }
    for (const blip of blips) {
      const clipped = blip.segment.clip(blip);
      blip.x = clipped.x;
      blip.y = clipped.y;
    }
    if (!collided) break;
  }
}

function placed({ entry, number, x, y }: WorkingBlip): PlacedBlip {
  return { ...entry, number, x, y };
}
