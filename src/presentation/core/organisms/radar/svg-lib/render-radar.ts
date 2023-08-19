/* eslint-disable no-loop-func */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { forceCollide, forceSimulation, select } from 'd3';

import type { RenderOptions, TRBlip, TRRingDefinition } from './types';
import {
  bounded_box,
  bounded_ring,
  cartesian,
  footer_offset,
  getLegendOffset,
  hideBubble,
  highlightLegendItem,
  polar,
  quadrants,
  translate,
  unhighlightLegendItem,
  viewbox,
} from './utils';

export function renderRadar(
  svg: ReturnType<typeof select>,
  entries: Array<TRBlip>,
  inputRingsDefinition: Array<TRRingDefinition>,
  quadrantNames: Array<string>,
  options: RenderOptions,
) {
  // ========================================================================

  const width = options.size;
  const height = Math.floor(options.size * 0.8);

  const lineLengthX = Math.floor(width * 0.38);
  const lineLengthY = lineLengthX;

  const config = {
    svg_id: options?.svgId ?? 'radar',
    width,
    height,
    colors: {
      background: '#fff',
      grid: '#bbb',
      inactive: '#ddd',
      ...options?.colors,
    },
    print_layout: options?.printLayout ?? true,
  };

  const ringsDefinition = inputRingsDefinition.map((ring, index) => ({
    ...ring,
    radius: (lineLengthY / inputRingsDefinition.length) * (index + 1),
  }));

  const legend_offset = getLegendOffset(options.size);

  // ========================================================================

  let seed = 42;
  function random() {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }

  function random_between(min: any, max: any) {
    return min + random() * (max - min);
  }

  function normal_between(min: any, max: any) {
    return min + (random() + random()) * 0.5 * (max - min);
  }

  function segment(quadrant: any, ring: any) {
    const polar_min = {
      t: quadrants[quadrant].radial_min * Math.PI,
      r: ring === 0 ? 30 : ringsDefinition[ring - 1].radius,
    };
    const polar_max = {
      t: quadrants[quadrant].radial_max * Math.PI,
      r: ringsDefinition[ring].radius,
    };
    const cartesian_min = {
      x: 15 * quadrants[quadrant].factor_x,
      y: 15 * quadrants[quadrant].factor_y,
    };
    const cartesian_max = {
      x: ringsDefinition[3].radius * quadrants[quadrant].factor_x,
      y: ringsDefinition[3].radius * quadrants[quadrant].factor_y,
    };
    return {
      clipx: function (d: any) {
        const c = bounded_box(d, cartesian_min, cartesian_max);
        const p = bounded_ring(polar(c), polar_min.r + 15, polar_max.r - 15);
        d.x = cartesian(p).x; // adjust data too!
        return d.x;
      },
      clipy: function (d: any) {
        const c = bounded_box(d, cartesian_min, cartesian_max);
        const p = bounded_ring(polar(c), polar_min.r + 15, polar_max.r - 15);
        d.y = cartesian(p).y; // adjust data too!
        return d.y;
      },
      random: function () {
        return cartesian({
          t: random_between(polar_min.t, polar_max.t),
          r: normal_between(polar_min.r, polar_max.r),
        });
      },
    };
  }

  // position each entry randomly in its segment
  for (let i = 0; i < entries.length; i++) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entry = entries[i] as any;
    entry.segment = segment(entry.quadrant, entry.ring);
    const point = entry.segment.random();
    entry.x = point.x;
    entry.y = point.y;
    entry.color = ringsDefinition[entry.ring].color;
  }

  // partition entries according to segments
  const segmented = new Array(4);
  for (let quadrant = 0; quadrant < 4; quadrant++) {
    segmented[quadrant] = new Array(4);
    for (let ring = 0; ring < ringsDefinition.length; ring++) {
      segmented[quadrant][ring] = [];
    }
  }

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    segmented[entry.quadrant][entry.ring].push(entry);
  }

  // assign unique sequential id to each entry
  let id = 1;
  for (const quadrant of [2, 3, 1, 0]) {
    for (let ring = 0; ring < 4; ring++) {
      const entries = segmented[quadrant][ring];
      entries.sort(function (a: any, b: any) {
        return a.label.localeCompare(b.label);
      });
      for (let i = 0; i < entries.length; i++) {
        entries[i].id = '' + id++;
      }
    }
  }

  svg
    .style('background-color', config.colors.background)
    .attr('width', config.width)
    .attr('height', config.height);

  const radar = svg.append('g');
  if ('zoomed_quadrant' in config) {
    //@ts-ignore
    svg.attr('viewBox', viewbox(config.zoomed_quadrant));
  } else {
    radar.attr('transform', translate(config.width / 2, config.height / 2));
  }

  const grid = radar.append('g');

  grid
    .append('line')
    .attr('x1', 0)
    .attr('y1', lineLengthY * -1)
    .attr('x2', 0)
    .attr('y2', lineLengthY)
    .style('stroke', config.colors.grid)
    .style('stroke-width', 1);
  grid
    .append('line')
    .attr('x1', lineLengthX * -1)
    .attr('y1', 0)
    .attr('x2', lineLengthX)
    .attr('y2', 0)
    .style('stroke', config.colors.grid)
    .style('stroke-width', 1);

  // background color. Usage `.attr("filter", "url(#solid)")`
  // SOURCE: https://stackoverflow.com/a/31013492/2609980
  const defs = grid.append('defs');
  const filter = defs
    .append('filter')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', 1)
    .attr('height', 1)
    .attr('id', 'solid');
  filter.append('feFlood').attr('flood-color', 'rgb(0, 0, 0, 0.8)');
  filter.append('feComposite').attr('in', 'SourceGraphic');

  // draw rings
  for (let i = 0; i < ringsDefinition.length; i++) {
    grid
      .append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', ringsDefinition[i].radius)
      .style('fill', 'none')
      .style('stroke', config.colors.grid)
      .style('stroke-width', 1);
    if (config.print_layout) {
      grid
        .append('text')
        .text(ringsDefinition[i].label)
        .attr('y', -ringsDefinition[i].radius + 62)
        .attr('text-anchor', 'middle')
        .style('fill', '#e5e5e5')
        .style('font-family', 'Arial, Helvetica')
        .style('font-size', '42px')
        .style('font-weight', 'bold')
        .style('pointer-events', 'none')
        .style('user-select', 'none');
    }
  }

  function legend_transform(quadrant: any, ring: any, index = null) {
    const dx = ring < 2 ? 0 : 120;
    let dy = index == null ? -16 : index * 12;
    if (ring % 2 === 1) {
      dy = dy + 36 + segmented[quadrant][ring - 1].length * 12;
    }
    return translate(
      legend_offset[quadrant].x + dx,
      legend_offset[quadrant].y + dy,
    );
  }

  // draw title and legend (only in print layout)
  if (config.print_layout) {
    // footer
    radar
      .append('text')
      .attr('transform', translate(footer_offset.x, footer_offset.y))
      .text('▲ moved up     ▼ moved down')
      .attr('xml:space', 'preserve')
      .style('font-family', 'Arial, Helvetica')
      .style('font-size', '10px');

    // legend
    const legend = radar.append('g');
    for (let quadrant = 0; quadrant < 4; quadrant++) {
      legend
        .append('text')
        .attr(
          'transform',
          translate(legend_offset[quadrant].x, legend_offset[quadrant].y - 45),
        )
        .text(quadrantNames[quadrant])
        .style('font-family', 'Arial, Helvetica')
        .style('font-size', '18px');
      for (let ring = 0; ring < 4; ring++) {
        legend
          .append('text')
          .attr('transform', legend_transform(quadrant, ring))
          .text(ringsDefinition[ring].label)
          .style('font-family', 'Arial, Helvetica')
          .style('font-size', '12px')
          .style('font-weight', 'bold');
        legend
          .selectAll('.legend' + quadrant + ring)
          .data(segmented[quadrant][ring])
          .enter()
          .append('a')
          .attr('href', function (d: any) {
            return d.link ? d.link : '#'; // stay on same page if no link was provided
          })
          .append('text')
          .attr('transform', function (_d, i) {
            return legend_transform(quadrant, ring, i as any);
          })
          .attr('class', 'legend' + quadrant + ring)
          .attr('id', function (d: any) {
            return 'legendItem' + d.id;
          })
          .text(function (d: any) {
            return d.id + '. ' + d.label;
          })
          .style('font-family', 'Arial, Helvetica')
          .style('font-size', '11px')
          .on('mouseover', function (d) {
            showBubble(d);
            highlightLegendItem(d);
          })
          .on('mouseout', function (d) {
            hideBubble();
            unhighlightLegendItem(d);
          });
      }
    }
  }

  // layer for entries
  const rink = radar.append('g').attr('id', 'rink');

  // rollover bubble (on top of everything else)
  const bubble = radar
    .append('g')
    .attr('id', 'bubble')
    .attr('x', 0)
    .attr('y', 0)
    .style('opacity', 0)
    .style('pointer-events', 'none')
    .style('user-select', 'none');
  bubble.append('rect').attr('rx', 4).attr('ry', 4).style('fill', '#333');
  bubble
    .append('text')
    .style('font-family', 'sans-serif')
    .style('font-size', '10px')
    .style('fill', '#fff');
  bubble.append('path').attr('d', 'M 0,0 10,0 5,8 z').style('fill', '#333');

  function showBubble(d: any) {
    if (d.active || config.print_layout) {
      const tooltip = select('#bubble text').text(d.label);
      const bbox = (tooltip.node() as any).getBBox();
      select('#bubble')
        .attr('transform', translate(d.x - bbox.width / 2, d.y - 16))
        .style('opacity', 0.8);
      select('#bubble rect')
        .attr('x', -5)
        .attr('y', -bbox.height)
        .attr('width', bbox.width + 10)
        .attr('height', bbox.height + 4);
      select('#bubble path').attr(
        'transform',
        translate(bbox.width / 2 - 5, 3),
      );
    }
  }

  // draw blips on radar
  const blips = rink
    .selectAll('.blip')
    .data(entries)
    .enter()
    .append('g')
    .attr('class', 'blip')
    .attr('transform', function (d, i) {
      return legend_transform(d.quadrant, d.ring, i as any);
    })
    .on('mouseover', function (d) {
      showBubble(d);
      highlightLegendItem(d);
    })
    .on('mouseout', function (d) {
      hideBubble();
      unhighlightLegendItem(d);
    });

  // configure each blip
  blips.each(function (d: any) {
    let blip = select(this);

    // blip link
    if (!config.print_layout && d.active && d.hasOwnProperty('link')) {
      //@ts-ignore
      blip = blip.append('a').attr('xlink:href', d.link);
    }

    // blip shape
    if (d.moved > 0) {
      blip
        .append('path')
        .attr('d', 'M -11,5 11,5 0,-13 z') // triangle pointing up
        .style('fill', d.color);
    } else if (d.moved < 0) {
      blip
        .append('path')
        .attr('d', 'M -11,-5 11,-5 0,13 z') // triangle pointing down
        .style('fill', d.color);
    } else {
      blip.append('circle').attr('r', 9).attr('fill', d.color);
    }

    // blip text
    if (d.active || config.print_layout) {
      const blip_text = config.print_layout ? d.id : d.label.match(/[a-z]/i);
      blip
        .append('text')
        .text(blip_text)
        .attr('y', 3)
        .attr('text-anchor', 'middle')
        .style('fill', '#fff')
        .style('font-family', 'Arial, Helvetica')
        .style('font-size', function () {
          return blip_text?.length > 2 ? '8px' : '9px';
        })
        .style('pointer-events', 'none')
        .style('user-select', 'none');
    }
  });

  // make sure that blips stay inside their segment
  function ticked() {
    blips.attr('transform', function (d: any) {
      return translate(d.segment.clipx(d), d.segment.clipy(d));
    });
  }

  // distribute blips, while avoiding collisions
  forceSimulation()
    //@ts-ignore
    .nodes(entries)
    .velocityDecay(0.19) // magic number (found by experimentation)
    .force('collision', forceCollide().radius(12).strength(0.85))
    .on('tick', ticked);
}
