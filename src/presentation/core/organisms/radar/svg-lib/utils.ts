import { select } from 'd3';

// radial_min / radial_max are multiples of PI
export const quadrants = [
  { radial_min: 0, radial_max: 0.5, factor_x: 1, factor_y: 1 },
  { radial_min: 0.5, radial_max: 1, factor_x: -1, factor_y: 1 },
  { radial_min: -1, radial_max: -0.5, factor_x: -1, factor_y: -1 },
  { radial_min: -0.5, radial_max: 0, factor_x: 1, factor_y: -1 },
];

export const footer_offset = { x: -675, y: 420 };

export const getLegendOffset = (size: number) => {
  const commonOffset = Math.floor(size * 0.31);
  const negativeOffset = commonOffset * -1;
  const leftReverseOffset = negativeOffset - 125;

  return [
    { x: commonOffset, y: commonOffset },
    { x: leftReverseOffset, y: commonOffset },
    { x: leftReverseOffset, y: negativeOffset },
    { x: commonOffset, y: negativeOffset },
  ];
};

export function polar(cartesian: any) {
  const x = cartesian.x;
  const y = cartesian.y;
  return {
    t: Math.atan2(y, x),
    r: Math.sqrt(x * x + y * y),
  };
}

export function cartesian(polar: any) {
  return {
    x: polar.r * Math.cos(polar.t),
    y: polar.r * Math.sin(polar.t),
  };
}

export function bounded_interval(value: any, min: any, max: any) {
  const low = Math.min(min, max);
  const high = Math.max(min, max);
  return Math.min(Math.max(value, low), high);
}

export function bounded_ring(polar: any, r_min: any, r_max: any) {
  return {
    t: polar.t,
    r: bounded_interval(polar.r, r_min, r_max),
  };
}

export function bounded_box(point: any, min: any, max: any) {
  return {
    x: bounded_interval(point.x, min.x, max.x),
    y: bounded_interval(point.y, min.y, max.y),
  };
}

export function translate(x: any, y: any) {
  return 'translate(' + x + ',' + y + ')';
}

export function viewbox(quadrant: any) {
  return [
    Math.max(0, quadrants[quadrant].factor_x * 400) - 420,
    Math.max(0, quadrants[quadrant].factor_y * 400) - 420,
    440,
    440,
  ].join(' ');
}

export function hideBubble() {
  select('#bubble').attr('transform', translate(0, 0)).style('opacity', 0);
}

export function highlightLegendItem(d: any) {
  const legendItem = document.getElementById('legendItem' + d.id);
  if (legendItem) {
    legendItem.setAttribute('filter', 'url(#solid)');
    legendItem.setAttribute('fill', 'white');
  }
}

export function unhighlightLegendItem(d: any) {
  const legendItem = document.getElementById('legendItem' + d.id);
  if (legendItem) {
    legendItem.removeAttribute('filter');
    legendItem.removeAttribute('fill');
  }
}
