/**
 * The radar itself: rings, axes and one blip per technology.
 *
 * A server component with no state and no effects — the layout is already
 * computed by `next build`, so the export carries the finished SVG and the
 * page ships no JavaScript for it (ADR 0003). Each blip links to its
 * technology's page (#42), and names itself on hover.
 *
 * The picture is decorative in the accessibility sense: `RadarLegend` carries
 * the same blips as text, which is the keyboard and screen-reader path. So a
 * blip's link is for the pointer only: out of the tab order, and hidden from
 * assistive technology, which Chromium would otherwise expose even inside a
 * `role="img"`.
 */
import type { SiteLocale } from '../../site-locales';
import { BLIP_RADIUS } from './geometry';
import { technologyPath } from './radar-paths';
import type { Movement, PlacedBlip, RadarLayout } from './types';

/** Room around the outer ring for the ring labels along the vertical axis. */
const MARGIN = 26;

export interface RadarChartProps {
  readonly layout: RadarLayout;
  readonly locale: SiteLocale;
  /** Quadrant names, by quadrant index. */
  readonly quadrants: readonly string[];
  /** Ring names, innermost first. */
  readonly rings: readonly string[];
  /** The accessible name of the picture as a whole. */
  readonly label: string;
}

export function RadarChart({
  layout,
  locale,
  quadrants,
  rings,
  label,
}: RadarChartProps) {
  const { extent, ringRadii, blips } = layout;
  const size = 2 * (extent + MARGIN);
  return (
    <svg
      viewBox={`${-extent - MARGIN} ${-extent - MARGIN} ${size} ${size}`}
      role="img"
      aria-label={label}
      /* A length, not a `max-w-*` step: entifix's tokens redefine that scale,
         and `max-w-2xl` there is a spacing token of about 80px. */
      className="mx-auto block h-auto w-full max-w-[42rem]"
    >
      <g>
        {[...ringRadii].reverse().map((radius, index) => (
          <circle
            key={radius}
            r={radius}
            fill={ringFill(ringRadii.length - 1 - index)}
            stroke="var(--color-radar-grid)"
            strokeWidth={1}
          />
        ))}
      </g>
      <line
        x1={-extent}
        y1={0}
        x2={extent}
        y2={0}
        stroke="var(--color-radar-grid)"
        strokeWidth={2}
      />
      <line
        x1={0}
        y1={-extent}
        x2={0}
        y2={extent}
        stroke="var(--color-radar-grid)"
        strokeWidth={2}
      />
      {quadrants.map((name, quadrant) => (
        <text
          key={name}
          x={quadrantLabel(quadrant, extent).x}
          y={quadrantLabel(quadrant, extent).y}
          textAnchor={quadrant === 1 || quadrant === 2 ? 'start' : 'end'}
          fill="var(--color-content-muted)"
          fontSize={16}
          className="select-none"
        >
          {name}
        </text>
      ))}
      {blips.map(blip => (
        <Blip key={blip.id} blip={blip} locale={locale} />
      ))}
      {/* Last, and haloed: a ring's name has to stay readable where a blip
          happens to sit under it, and the legend carries the blip anyway. */}
      {ringRadii.map((radius, ring) => (
        <text
          key={radius}
          x={0}
          y={-(ring === 0 ? radius / 2 : (ringRadii[ring - 1] + radius) / 2)}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="var(--color-content-muted)"
          fontSize={14}
          stroke={ringFill(ring)}
          strokeWidth={5}
          paintOrder="stroke"
          className="select-none"
        >
          {rings[ring]}
        </text>
      ))}
    </svg>
  );
}

function Blip({ blip, locale }: { blip: PlacedBlip; locale: SiteLocale }) {
  const colour = `var(--color-radar-ring-${blip.ring + 1})`;
  const title = `${blip.number}. ${blip.label[locale]}`;
  return (
    <a
      href={technologyPath(locale, blip.id)}
      tabIndex={-1}
      aria-hidden
      data-blip={blip.id}
      className="radar-blip"
    >
      <g transform={`translate(${blip.x.toFixed(2)}, ${blip.y.toFixed(2)})`}>
        <title>{title}</title>
        <path d={blipPath(blip.movement)} fill={colour} />
        <text
          y={numberOffset(blip.movement)}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="var(--color-radar-blip-ink)"
          fontSize={11}
          fontWeight={600}
          className="select-none"
        >
          {blip.number}
        </text>
      </g>
    </a>
  );
}

/**
 * The shape says how the technology moved, as the reference radar draws it: a
 * triangle points the way it went, a star is new, a circle has not moved.
 * Shape carries the meaning so it survives a monochrome print and colour
 * blindness — the ring's colour repeats it, it does not carry it.
 */
function blipPath(movement: Movement) {
  const r = BLIP_RADIUS - 2;
  switch (movement) {
    // Zalando's proportions: a triangle wide enough at its base to carry a
    // two-digit number, which a triangle inscribed in the circle is not.
    case 'in':
      return 'M -13 6 L 13 6 L 0 -15 Z';
    case 'out':
      return 'M -13 -6 L 13 -6 L 0 15 Z';
    case 'new':
      return star(BLIP_RADIUS + 2);
    case 'none':
      return `M ${-r} 0 A ${r} ${r} 0 1 0 ${r} 0 A ${r} ${r} 0 1 0 ${-r} 0 Z`;
  }
}

/** The widest part of the shape, where the number has room to sit. */
function numberOffset(movement: Movement) {
  switch (movement) {
    case 'in':
      return 2;
    case 'out':
      return -1;
    case 'new':
      return 2;
    case 'none':
      return 1;
  }
}

/** A five-pointed star, plump enough that the number still reads inside it. */
function star(radius: number) {
  const points: string[] = [];
  for (let corner = 0; corner < 10; corner++) {
    const angle = (Math.PI / 5) * corner - Math.PI / 2;
    const reach = corner % 2 === 0 ? radius : radius * 0.62;
    points.push(
      `${(Math.cos(angle) * reach).toFixed(2)} ${(Math.sin(angle) * reach).toFixed(2)}`,
    );
  }
  return `M ${points.join(' L ')} Z`;
}

/** The outer corner of a quadrant, where its name sits. */
function quadrantLabel(quadrant: number, extent: number) {
  const right = quadrant === 0 || quadrant === 3;
  const bottom = quadrant === 0 || quadrant === 1;
  return {
    x: right ? extent : -extent,
    y: (bottom ? extent : -extent) + (bottom ? 16 : -6),
  };
}

/**
 * The rings alternate between the surface and a faint wash, so each band reads
 * as its own. Both are solid: the circles are nested and drawn outwards in,
 * and a transparent one would not cover the band underneath it.
 */
function ringFill(ring: number) {
  return ring % 2 === 0
    ? 'var(--color-radar-ring-fill)'
    : 'var(--color-surface-elevated)';
}
