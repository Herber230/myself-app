'use client';

import { cn } from '@entifix/react-controls/primitives';
import { useId } from 'react';

import {
  BAND_HEIGHT,
  bandY,
  BOX_HEIGHT,
  BOX_WIDTH,
  boxCentreX,
  boxY,
  edgePath,
  LAYER_WIDTH,
  layerHeight,
} from './layout.js';

export interface LayerBox {
  readonly id: string;
  readonly label: string;
  readonly band: number;
  /** 0 to 3; halves sit between two. */
  readonly column: number;
}

export interface LayerEdge {
  readonly from: string;
  readonly to: string;
  /** Why it is refused, for an import a rule refuses: drawn dashed. */
  readonly refused?: string;
}

export interface LayerDiagramProps {
  /** The bands' names, top first. */
  readonly bands: readonly string[];
  readonly boxes: readonly LayerBox[];
  /** The arrows to draw: an import, from the importer to what it imports. */
  readonly edges: readonly LayerEdge[];
  /** The box under the pointer or focus: its arrows stand out, others fade. */
  readonly active?: string;
  /** Told which box the pointer or focus reached. */
  readonly onActive?: (id: string) => void;
  /** The picture's accessible name. */
  readonly label: string;
  readonly className?: string;
}

const BOX =
  'cursor-pointer outline-none [&>rect]:fill-(--color-surface) [&>rect]:stroke-(--color-border) [&>rect]:[stroke-width:1.5] [&>rect]:transition-[stroke] hover:[&>rect]:stroke-(--color-primary) focus-visible:[&>rect]:stroke-(--color-primary) data-active:[&>rect]:stroke-(--color-primary) motion-reduce:[&>rect]:transition-none';

const EDGE =
  'fill-none stroke-[color-mix(in_srgb,var(--color-content)_35%,transparent)] [stroke-width:1.5] transition-opacity duration-200 data-dim:opacity-[0.22] data-out:stroke-(--color-primary) data-out:[stroke-width:2.25] data-refused:stroke-(--color-danger) data-refused:[stroke-dasharray:6_5] motion-reduce:transition-none';

/**
 * Packages in their layers: one band per layer, top first, a box per
 * package, and an arrow per import, from the importer to what it imports.
 * An import a rule refuses is drawn dashed, in the danger colour, its reason
 * as its title. The active box's own arrows stand out and the rest fade.
 *
 * It holds no state: the page says which box is active and which arrows to
 * draw. Each box is a button, reached by pointer or Tab. Parts carry
 * `data-slot` (`layer-diagram`, `layer-band`, `layer-edge`, `layer-box`).
 */
export function LayerDiagram({
  bands,
  boxes,
  edges,
  active,
  onActive,
  label,
  className,
}: LayerDiagramProps) {
  const id = useId();
  const byId = new Map(boxes.map(box => [box.id, box]));
  const arrow = `${id}-arrow`;
  const refusedArrow = `${id}-refused`;
  const head = (markerId: string, fill: string) => (
    <marker
      id={markerId}
      viewBox="0 0 10 10"
      refX="9"
      refY="5"
      markerWidth="7"
      markerHeight="7"
      orient="auto-start-reverse"
    >
      <path d="M0 0L10 5L0 10z" className={fill} />
    </marker>
  );

  return (
    <svg
      data-slot="layer-diagram"
      viewBox={`0 0 ${LAYER_WIDTH} ${layerHeight(bands.length)}`}
      role="group"
      aria-label={label}
      className={cn('block h-auto w-full', className)}
    >
      <defs>
        {head(
          arrow,
          'fill-[color-mix(in_srgb,var(--color-content)_45%,transparent)]',
        )}
        {head(refusedArrow, 'fill-(--color-danger)')}
      </defs>
      {bands.map((band, index) => (
        <g key={band} data-slot="layer-band">
          <rect
            x={0}
            y={bandY(index) + 4}
            width={LAYER_WIDTH}
            height={BAND_HEIGHT - 8}
            rx={10}
            className="fill-[color-mix(in_srgb,var(--color-content)_3%,transparent)]"
          />
          <text
            x={16}
            y={bandY(index) + BAND_HEIGHT / 2 + 4}
            className="fill-(--color-content-muted) text-[12px] tracking-[0.06em] uppercase"
          >
            {band}
          </text>
        </g>
      ))}
      {edges.map(edge => {
        const [from, to] = [byId.get(edge.from), byId.get(edge.to)];
        if (from === undefined || to === undefined) return null;
        const touching =
          active === undefined || edge.from === active || edge.to === active;
        return (
          <path
            key={`${edge.from}>${edge.to}`}
            data-slot="layer-edge"
            data-refused={edge.refused === undefined ? undefined : ''}
            data-dim={touching ? undefined : ''}
            data-out={edge.from === active ? '' : undefined}
            d={edgePath(from, to)}
            markerEnd={`url(#${edge.refused === undefined ? arrow : refusedArrow})`}
            className={EDGE}
          >
            {edge.refused !== undefined && <title>{edge.refused}</title>}
          </path>
        );
      })}
      {boxes.map(box => (
        <g
          key={box.id}
          data-slot="layer-box"
          data-active={box.id === active ? '' : undefined}
          role="button"
          tabIndex={0}
          aria-label={box.label}
          aria-pressed={box.id === active}
          onMouseEnter={() => onActive?.(box.id)}
          onFocus={() => onActive?.(box.id)}
          onClick={() => onActive?.(box.id)}
          className={BOX}
        >
          <rect
            x={boxCentreX(box) - BOX_WIDTH / 2}
            y={boxY(box)}
            width={BOX_WIDTH}
            height={BOX_HEIGHT}
            rx={8}
          />
          <text
            x={boxCentreX(box)}
            y={boxY(box) + BOX_HEIGHT / 2 + 5}
            className="pointer-events-none fill-(--color-content) font-mono text-[12px] [text-anchor:middle]"
          >
            {box.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
