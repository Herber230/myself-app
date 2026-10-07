/**
 * Where the hexagon's rings and parts sit, in the picture's own units. Every
 * number is rounded to two decimals: the server that renders the picture and
 * the browser that hydrates it disagree on trigonometry past them, and React
 * would refuse the markup.
 */

/** The picture's size, and its centre. */
export const HEXAGON_WIDTH = 640;
export const HEXAGON_HEIGHT = 500;
export const HEXAGON_CENTRE = { x: 320, y: 250 } as const;

/** The outer ring's corner radius. */
const OUTER = 262;
/** The inner ring's radius, as a share of the outer one. */
const INNER_SHARE = 0.4;
/** How much flatter than wide the ellipse a ring's parts sit on is. */
const FLATTEN = 0.85;

/** A part's height, and the width its label adds per character. */
export const NODE_HEIGHT = 28;
const CHARACTER = 7.4;
const PADDING = 26;

export interface Point {
  readonly x: number;
  readonly y: number;
}

export function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/** The corner radius of ring `index` of `count`, the innermost first. */
export function ringRadius(index: number, count: number): number {
  const share =
    count < 2 ? 1 : INNER_SHARE + ((1 - INNER_SHARE) * index) / (count - 1);
  return round(OUTER * share);
}

/** A flat-topped hexagon's corners, as an SVG `points` list. */
export function hexagonPoints(radius: number): string {
  return Array.from({ length: 6 }, (_, corner) => {
    const angle = (Math.PI / 3) * corner;
    return `${round(HEXAGON_CENTRE.x + radius * Math.cos(angle))},${round(
      HEXAGON_CENTRE.y + radius * Math.sin(angle),
    )}`;
  }).join(' ');
}

/** Where a ring's name sits: just inside its top edge. */
export function ringLabelY(radius: number): number {
  return round(HEXAGON_CENTRE.y - radius * Math.sin(Math.PI / 3) + 17);
}

/**
 * Where a part of ring `index` sits, at `angle` degrees clockwise from three
 * o'clock: between its ring's edge and the one inside it. The innermost
 * ring's parts sit on a vertical line through the centre.
 */
export function nodePosition(
  index: number,
  count: number,
  angle: number,
): Point {
  const radians = (angle * Math.PI) / 180;
  const outer = ringRadius(index, count);
  if (index === 0) {
    const reach = outer * 0.4;
    return {
      x: HEXAGON_CENTRE.x,
      y: round(HEXAGON_CENTRE.y + reach * Math.sin(radians)),
    };
  }
  const across = (ringRadius(index - 1, count) + outer) / 2;
  return {
    x: round(HEXAGON_CENTRE.x + across * Math.cos(radians)),
    y: round(HEXAGON_CENTRE.y + across * FLATTEN * Math.sin(radians)),
  };
}

/** A part's width: room for its label in the picture's monospace. */
export function nodeWidth(label: string): number {
  return round(label.length * CHARACTER + PADDING);
}
