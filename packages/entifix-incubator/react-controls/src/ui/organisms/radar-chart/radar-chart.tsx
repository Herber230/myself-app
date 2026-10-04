/**
 * The radar itself: rings, axes and one blip per technology.
 *
 * Its colours are custom properties the page defines: `--color-radar-grid`,
 * `--color-radar-ring-fill`, `--color-radar-ring-1` to `-4` (one per ring,
 * innermost first) and `--color-radar-blip-ink`, beside entifix's
 * `--color-content-muted` and `--color-surface-elevated`.
 *
 * A server component with no state and no effects — the layout is already
 * computed by `next build`, so the export carries the finished SVG and the
 * page ships no JavaScript for it (ADR 0003). Each blip links to its
 * technology's page (#42), and names itself on hover.
 *
 * Given `onQuadrant`, the quadrant names become toggle buttons over the
 * picture's corners — beside the SVG, not in it, since a `role="img"` holds no
 * controls — so a page with scripting can filter from the chart itself. Given
 * `zoom`, one quadrant fills the picture, its blips twice the size.
 *
 * The picture is decorative in the accessibility sense: `RadarLegend` carries
 * the same blips as text, which is the keyboard and screen-reader path. So a
 * blip's link is for the pointer only: out of the tab order, and hidden from
 * assistive technology, which Chromium would otherwise expose even inside a
 * `role="img"`.
 */
import { BLIP_RADIUS } from './geometry.js';
import type { Movement, PlacedBlip, RadarLayout } from './types.js';

/**
 * A blip under the pointer, and the one its legend entry names (#40), is
 * outlined; one a filter leaves out (#41) is faint, in place, so the shape
 * still reads.
 */
const BLIP =
  'cursor-pointer data-dimmed:opacity-[0.18] [&[data-highlighted]_path]:stroke-(--color-content) [&[data-highlighted]_path]:stroke-2';

/** Room around the outer ring for the ring labels along the vertical axis. */
const MARGIN = 26;

export interface RadarChartProps {
  readonly layout: RadarLayout;
  /** Which of each label to show. */
  readonly locale: string;
  /** Where a blip links: its technology's own page. */
  readonly hrefOf: (id: string) => string;
  /** Quadrant names, by quadrant index. */
  readonly quadrants: readonly string[];
  /** Ring names, innermost first. */
  readonly rings: readonly string[];
  /** The accessible name of the picture as a whole. */
  readonly label: string;
  /** Blips a filter leaves out: drawn faint, in place (#41). */
  readonly dimmed?: ReadonlySet<string>;
  /** The blip under the pointer here or in the legend. */
  readonly highlighted?: string;
  /** Told which blip the pointer is over, or `undefined` when it leaves. */
  readonly onHighlight?: (id: string | undefined) => void;
  /** Told which quadrant's name was pressed: the names become buttons. */
  readonly onQuadrant?: (quadrant: number) => void;
  /** The quadrants pressed, by index. */
  readonly selectedQuadrants?: readonly number[];
  /** A quadrant to fill the picture with, by index: the rest scrolls away. */
  readonly zoom?: number;
  /** The zoomed quadrant's button's title: pressing it shows the whole. */
  readonly zoomOutLabel?: string;
}

/** A quadrant's name as a button: quiet, a chip once pressed. */
const QUADRANT_TOGGLE =
  'focus-ring absolute cursor-pointer rounded-full border border-transparent bg-transparent px-2xs py-[0.125rem] font-[inherit] text-step-xs leading-tight text-content-muted transition-[background-color,border-color,color] duration-(--duration-fast,150ms) hover:border-primary hover:text-primary aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-surface motion-reduce:transition-none';

export function RadarChart({
  layout,
  locale,
  hrefOf,
  quadrants,
  rings,
  label,
  dimmed,
  highlighted,
  onHighlight,
  onQuadrant,
  selectedQuadrants = [],
  zoom,
  zoomOutLabel,
}: RadarChartProps) {
  const { extent, ringRadii, blips } = layout;
  const size = 2 * (extent + MARGIN);
  // The corners' inset, as a share of the picture: it scales with it.
  const inset = `${((MARGIN / size) * 100).toFixed(2)}%`;
  return (
    <div
      data-slot="radar-chart"
      /* A length, not a `max-w-*` step: entifix's tokens redefine that scale,
         and `max-w-2xl` there is a spacing token of about 80px. */
      className="relative mx-auto w-full max-w-[42rem]"
    >
      <svg
        viewBox={`${-extent - MARGIN} ${-extent - MARGIN} ${size} ${size}`}
        role="img"
        aria-label={label}
        className="block h-auto w-full"
      >
        {/* Zoomed, the picture doubles from the quadrant's outer corner, so
            that quadrant fills it; the viewport clips the rest. */}
        <g
          data-slot="radar-zoom"
          className="transition-transform duration-300 ease-out motion-reduce:transition-none"
          style={{
            // A view box's origin is the user space's, not the picture's
            // corner: the zoomed quadrant's outer corner, in user units.
            transformBox: 'view-box',
            transformOrigin: zoomOrigin(zoom ?? 0, extent + MARGIN),
            transform: zoom === undefined ? undefined : 'scale(2)',
          }}
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
          {onQuadrant === undefined &&
            quadrants.map((name, quadrant) => (
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
            <Blip
              key={blip.id}
              blip={blip}
              href={hrefOf(blip.id)}
              title={`${blip.number}. ${blip.label[locale] ?? blip.id}`}
              dimmed={dimmed?.has(blip.id) === true}
              highlighted={highlighted === blip.id}
              onHighlight={onHighlight}
            />
          ))}
          {/* Last, and haloed: a ring's name has to stay readable where a blip
          happens to sit under it, and the legend carries the blip anyway. */}
          {ringRadii.map((radius, ring) => {
            const middle =
              ring === 0 ? radius / 2 : (ringRadii[ring - 1] + radius) / 2;
            return (
              <text
                key={radius}
                {...ringLabel(zoom, middle)}
                dominantBaseline="middle"
                fill="var(--color-content-muted)"
                // Zoomed, the picture doubles: the names keep their size.
                fontSize={zoom === undefined ? 14 : 8}
                stroke={ringFill(ring)}
                strokeWidth={zoom === undefined ? 5 : 3}
                paintOrder="stroke"
                className="select-none"
              >
                {rings[ring]}
              </text>
            );
          })}
        </g>
      </svg>
      {onQuadrant !== undefined &&
        quadrants.map((name, quadrant) => {
          // Zoomed, only that quadrant's name is in the picture: pressing it
          // shows the whole again.
          if (zoom !== undefined && quadrant !== zoom) return null;
          const right = quadrant === 0 || quadrant === 3;
          const bottom = quadrant === 0 || quadrant === 1;
          return (
            <button
              key={name}
              type="button"
              data-slot="radar-quadrant-toggle"
              aria-pressed={selectedQuadrants.includes(quadrant)}
              title={quadrant === zoom ? zoomOutLabel : undefined}
              className={QUADRANT_TOGGLE}
              style={{
                [right ? 'right' : 'left']: inset,
                [bottom ? 'bottom' : 'top']: 0,
              }}
              onClick={() => onQuadrant(quadrant)}
            >
              {name}
            </button>
          );
        })}
    </div>
  );
}

function Blip({
  blip,
  href,
  title,
  dimmed,
  highlighted,
  onHighlight,
}: {
  blip: PlacedBlip;
  href: string;
  title: string;
  dimmed: boolean;
  highlighted: boolean;
  onHighlight?: (id: string | undefined) => void;
}) {
  const colour = `var(--color-radar-ring-${blip.ring + 1})`;
  return (
    <a
      href={href}
      tabIndex={-1}
      aria-hidden
      data-blip={blip.id}
      data-dimmed={dimmed || undefined}
      data-highlighted={highlighted || undefined}
      className={BLIP}
      onPointerEnter={() => onHighlight?.(blip.id)}
      onPointerLeave={() => onHighlight?.(undefined)}
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

/**
 * Where a ring's name sits, `middle` from the centre: up the vertical axis,
 * or, zoomed, along it inside the zoomed quadrant, where it would otherwise be
 * cut in half or out of the picture.
 */
function ringLabel(zoom: number | undefined, middle: number) {
  if (zoom === undefined)
    return { x: 0, y: -middle, textAnchor: 'middle' } as const;
  const right = zoom === 0 || zoom === 3;
  const bottom = zoom === 0 || zoom === 1;
  return {
    x: right ? 4 : -4,
    y: bottom ? middle : -middle,
    textAnchor: right ? 'start' : 'end',
  } as const;
}

/** A quadrant's outer corner, `reach` from the centre: where it zooms from. */
function zoomOrigin(quadrant: number, reach: number) {
  const right = quadrant === 0 || quadrant === 3;
  const bottom = quadrant === 0 || quadrant === 1;
  return `${right ? reach : -reach}px ${bottom ? reach : -reach}px`;
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
