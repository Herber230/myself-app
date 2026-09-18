/*
 * Derived from zalando/tech-radar, `docs/radar.js` (the seeded generator at
 * lines 49-63).
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

/** Zalando's seed, kept so a port and the reference app place blips alike. */
export const DEFAULT_SEED = 42;

export interface SeededRandom {
  /** The next value in `[0, 1)`. */
  next(): number;
  /** Uniform in `[min, max)`. */
  between(min: number, max: number): number;
  /** Two uniform draws averaged: the middle of the interval is likelier. */
  normalBetween(min: number, max: number): number;
}

/**
 * A reproducible generator, so a build places blips exactly where the last one
 * did. `Math.random` would move every blip on every build and make a
 * screenshot diff meaningless.
 *
 * The recurrence is Zalando's, itself from
 * https://stackoverflow.com/questions/521295 — the fractional part of
 * `sin(seed) * 10000`. Not a good generator in any cryptographic or
 * statistical sense; it only has to be stable and spread out.
 */
export function createRandom(seed: number = DEFAULT_SEED): SeededRandom {
  let state = seed;
  const next = () => {
    const x = Math.sin(state++) * 10000;
    return x - Math.floor(x);
  };
  return {
    next,
    between: (min, max) => min + next() * (max - min),
    normalBetween: (min, max) => min + (next() + next()) * 0.5 * (max - min),
  };
}
