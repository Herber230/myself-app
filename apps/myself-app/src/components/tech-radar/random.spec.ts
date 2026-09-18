import { describe, expect, it } from 'vitest';

import { createRandom, DEFAULT_SEED } from './random';

describe('the radar generator', () => {
  it('repeats itself for a seed, so a build places blips where the last one did', () => {
    const first = createRandom(DEFAULT_SEED);
    const second = createRandom(DEFAULT_SEED);
    const draws = Array.from({ length: 20 }, () => first.next());
    expect(draws).toEqual(Array.from({ length: 20 }, () => second.next()));
  });

  it('gives a different sequence for a different seed', () => {
    const fortyTwo = createRandom(42);
    const seven = createRandom(7);
    expect(fortyTwo.next()).not.toBe(seven.next());
  });

  it('draws inside the unit interval', () => {
    const random = createRandom(1);
    for (let draw = 0; draw < 500; draw++) {
      const value = random.next();
      expect(value, `draw ${draw}`).toBeGreaterThanOrEqual(0);
      expect(value, `draw ${draw}`).toBeLessThan(1);
    }
  });

  it('stays inside an interval, either way round', () => {
    const random = createRandom(3);
    for (let draw = 0; draw < 200; draw++) {
      expect(random.between(-5, 5)).toBeGreaterThanOrEqual(-5);
      expect(random.between(-5, 5)).toBeLessThanOrEqual(5);
      expect(random.normalBetween(30, 130)).toBeGreaterThanOrEqual(30);
      expect(random.normalBetween(30, 130)).toBeLessThanOrEqual(130);
    }
  });

  it('crowds the middle of an interval, which spreads blips across a ring', () => {
    const random = createRandom(DEFAULT_SEED);
    const middle = Array.from({ length: 1000 }, () =>
      random.normalBetween(0, 1),
    ).filter(value => value > 0.25 && value < 0.75).length;
    // A uniform draw would put ~500 in the middle half; averaging two puts far more.
    expect(middle).toBeGreaterThan(600);
  });
});
