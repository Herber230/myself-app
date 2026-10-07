import { describe, expect, it } from 'vitest';

import {
  HEXAGON_CENTRE,
  hexagonPoints,
  nodePosition,
  nodeWidth,
  ringLabelY,
  ringRadius,
  round,
} from './geometry';

describe("the hexagon's geometry", () => {
  it('rounds to two decimals, as server and browser agree', () => {
    expect(round(1.23456)).toBe(1.23);
    expect(round(Math.cos(Math.PI / 3) * 100)).toBe(50);
  });

  it('spreads the rings from two fifths of the outer one to all of it', () => {
    expect(ringRadius(0, 3)).toBe(104.8);
    expect(ringRadius(2, 3)).toBe(262);
    expect(ringRadius(1, 3)).toBeGreaterThan(ringRadius(0, 3));
    // A single ring takes the whole picture.
    expect(ringRadius(0, 1)).toBe(262);
  });

  it('draws a flat-topped hexagon of six corners, the first at three o’clock', () => {
    const corners = hexagonPoints(100).split(' ');
    expect(corners).toHaveLength(6);
    expect(corners[0]).toBe(`${HEXAGON_CENTRE.x + 100},${HEXAGON_CENTRE.y}`);
  });

  it('names a ring just inside its top edge', () => {
    expect(ringLabelY(100)).toBe(
      round(HEXAGON_CENTRE.y - 100 * Math.sin(Math.PI / 3) + 17),
    );
  });

  it('stacks the centre’s parts on a vertical line, and places the others between their ring and the one inside', () => {
    expect(nodePosition(0, 3, -90).x).toBe(HEXAGON_CENTRE.x);
    expect(nodePosition(0, 3, -90).y).toBeLessThan(HEXAGON_CENTRE.y);
    expect(nodePosition(0, 3, 90).y).toBeGreaterThan(HEXAGON_CENTRE.y);
    const right = nodePosition(2, 3, 0);
    expect(right.y).toBe(HEXAGON_CENTRE.y);
    expect(right.x - HEXAGON_CENTRE.x).toBeGreaterThan(ringRadius(1, 3));
    expect(right.x - HEXAGON_CENTRE.x).toBeLessThan(ringRadius(2, 3));
  });

  it('makes room for a label', () => {
    expect(nodeWidth('SQL')).toBeLessThan(nodeWidth('EntityRepository'));
  });
});
