import { describe, expect, it } from 'vitest';

import {
  BAND_HEIGHT,
  BAND_TOP,
  bandY,
  BOX_HEIGHT,
  BOX_WIDTH,
  boxCentreX,
  boxY,
  edgePath,
  layerHeight,
} from './layout';

describe("the layer diagram's layout", () => {
  it('stacks the bands, with room above and below', () => {
    expect(layerHeight(4)).toBe(BAND_TOP * 2 + 4 * BAND_HEIGHT);
    expect(bandY(1) - bandY(0)).toBe(BAND_HEIGHT);
  });

  it('places a box by its column, halves between two, centred in its band', () => {
    const at = (column: number) => boxCentreX({ band: 0, column });
    expect(at(0.5)).toBe((at(0) + at(1)) / 2);
    expect(boxY({ band: 1, column: 0 })).toBe(
      bandY(1) + (BAND_HEIGHT - BOX_HEIGHT) / 2,
    );
  });

  it('draws an import down from the bottom edge, or up from the top', () => {
    const top = { band: 0, column: 0 };
    const below = { band: 1, column: 2 };
    expect(edgePath(top, below)).toMatch(
      new RegExp(`^M${boxCentreX(top)} ${boxY(top) + BOX_HEIGHT}C`),
    );
    expect(edgePath(below, top)).toMatch(
      new RegExp(`^M${boxCentreX(below)} ${boxY(below)}C`),
    );
  });

  it('draws one across a band from the side that faces the other', () => {
    const left = { band: 0, column: 0 };
    const right = { band: 0, column: 2 };
    const y = boxY(left) + BOX_HEIGHT / 2;
    expect(edgePath(left, right)).toBe(
      `M${boxCentreX(left) + BOX_WIDTH / 2} ${y}L${boxCentreX(right) - BOX_WIDTH / 2} ${y}`,
    );
    expect(edgePath(right, left)).toBe(
      `M${boxCentreX(right) - BOX_WIDTH / 2} ${y}L${boxCentreX(left) + BOX_WIDTH / 2} ${y}`,
    );
  });
});
