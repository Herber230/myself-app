/**
 * Where the layer diagram's bands and boxes sit, in the picture's own units:
 * a column of band names on the left, four columns of boxes beside it.
 */

export const LAYER_WIDTH = 800;
export const BAND_HEIGHT = 84;
export const BAND_TOP = 12;
export const BOX_WIDTH = 150;
export const BOX_HEIGHT = 44;
const NAMES_WIDTH = 150;
const COLUMN = 150;

export interface LayerBoxPlace {
  readonly band: number;
  /** 0 to 3; halves sit between two. */
  readonly column: number;
}

/** The picture's height for `bands` bands. */
export function layerHeight(bands: number): number {
  return BAND_TOP * 2 + bands * BAND_HEIGHT;
}

/** A band's top edge. */
export function bandY(band: number): number {
  return BAND_TOP + band * BAND_HEIGHT;
}

export function boxCentreX(box: LayerBoxPlace): number {
  return NAMES_WIDTH + 80 + box.column * COLUMN;
}

export function boxY(box: LayerBoxPlace): number {
  return bandY(box.band) + (BAND_HEIGHT - BOX_HEIGHT) / 2;
}

/**
 * An arrow from one box to another, as an SVG path: down from the bottom
 * edge, up from the top, or across from the side when both share a band.
 */
export function edgePath(from: LayerBoxPlace, to: LayerBoxPlace): string {
  const [x1, x2] = [boxCentreX(from), boxCentreX(to)];
  const [y1, y2] = [boxY(from), boxY(to)];
  if (from.band === to.band) {
    const side = x2 > x1 ? 1 : -1;
    const y = y1 + BOX_HEIGHT / 2;
    return `M${x1 + (side * BOX_WIDTH) / 2} ${y}L${x2 - (side * BOX_WIDTH) / 2} ${y}`;
  }
  const down = to.band > from.band;
  const start = down ? y1 + BOX_HEIGHT : y1;
  const end = down ? y2 : y2 + BOX_HEIGHT;
  const middle = (start + end) / 2;
  return `M${x1} ${start}C${x1} ${middle} ${x2} ${middle} ${x2} ${end}`;
}
