'use client';

import { cn } from '@entifix/react-controls/primitives';
import type { KeyboardEvent } from 'react';

import {
  HEXAGON_CENTRE,
  HEXAGON_HEIGHT,
  HEXAGON_WIDTH,
  hexagonPoints,
  NODE_HEIGHT,
  nodePosition,
  nodeWidth,
  ringLabelY,
  ringRadius,
} from './geometry.js';

/** How a part is drawn: lit by a step, failing at one, or faint. */
export type HexagonNodeState = 'lit' | 'fails' | 'dim';

export interface HexagonRing {
  readonly id: string;
  readonly label: string;
}

export interface HexagonNode {
  readonly id: string;
  readonly label: string;
  /** Its ring's id. */
  readonly ring: string;
  /** Degrees, clockwise from three o'clock. */
  readonly angle: number;
  readonly state?: HexagonNodeState;
}

export interface HexagonEdge {
  readonly from: string;
  readonly to: string;
  /** Travelled by the step shown: drawn moving. */
  readonly travelled?: boolean;
  readonly dim?: boolean;
}

export interface HexagonDiagramProps {
  /** The rings, innermost first. */
  readonly rings: readonly HexagonRing[];
  readonly nodes: readonly HexagonNode[];
  readonly edges: readonly HexagonEdge[];
  /** The part chosen: drawn pressed. */
  readonly selected?: string;
  /** Told which part was chosen, by pointer or keyboard. */
  readonly onSelect?: (id: string) => void;
  /** The picture's accessible name. */
  readonly label: string;
  readonly className?: string;
}

const RING_FILL = [
  'fill-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] stroke-[color-mix(in_srgb,var(--color-primary)_45%,transparent)]',
  'fill-[color-mix(in_srgb,var(--color-content)_5%,transparent)] stroke-(--color-border) [stroke-dasharray:5_5]',
  'fill-[color-mix(in_srgb,var(--color-content)_3%,transparent)] stroke-(--color-border)',
];

const NODE =
  'cursor-pointer outline-none transition-opacity duration-200 data-[state=dim]:opacity-[0.22] motion-reduce:transition-none';

const PILL =
  'fill-(--color-surface) stroke-(--color-border) [stroke-width:1.5] transition-[fill,stroke] duration-200 motion-reduce:transition-none [[data-slot=hexagon-node]:hover_&]:stroke-(--color-primary) [[data-slot=hexagon-node]:focus-visible_&]:stroke-(--color-primary) [[aria-pressed=true]_&]:stroke-(--color-primary) [[data-state=lit]_&]:fill-(--color-primary) [[data-state=lit]_&]:stroke-(--color-primary) [[data-state=fails]_&]:fill-(--color-danger) [[data-state=fails]_&]:stroke-(--color-danger)';

const NODE_TEXT =
  'pointer-events-none fill-(--color-content) font-mono text-[12px] [text-anchor:middle] [[data-state=lit]_&]:fill-(--color-primary-content) [[data-state=lit]_&]:font-semibold [[data-state=fails]_&]:fill-(--color-danger-content)';

const EDGE =
  'stroke-[color-mix(in_srgb,var(--color-content)_22%,transparent)] [stroke-width:1.5] transition-opacity duration-200 data-dim:opacity-[0.22] data-travelled:stroke-(--color-primary) data-travelled:[stroke-width:2.5] data-travelled:[stroke-dasharray:6_5] data-travelled:animate-[hexagon-flow_700ms_linear_infinite] motion-reduce:animate-none motion-reduce:transition-none';

/**
 * Ports and adapters as concentric hexagons: a domain at the centre, rings
 * around it, each part a pill on its ring, and a line for each connection.
 * A part a step lights is filled; one it fails at, in the danger colour; one
 * out of the picture's scope, faint. The line a step travels moves.
 *
 * It holds no state: the page says what is lit, chosen and travelled. Each
 * part is a button (Enter or Space chooses it). Parts carry `data-slot`
 * (`hexagon-diagram`, `hexagon-ring`, `hexagon-edge`, `hexagon-node`), and the
 * moving line needs the page's `@keyframes hexagon-flow` (a dash offset).
 */
export function HexagonDiagram({
  rings,
  nodes,
  edges,
  selected,
  onSelect,
  label,
  className,
}: HexagonDiagramProps) {
  const ringIndex = new Map(rings.map((ring, index) => [ring.id, index]));
  const position = (node: HexagonNode) =>
    nodePosition(ringIndex.get(node.ring) ?? 0, rings.length, node.angle);
  const byId = new Map(nodes.map(node => [node.id, node]));
  const choose = (id: string) => onSelect?.(id);
  const key = (id: string) => (event: KeyboardEvent<SVGGElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    choose(id);
  };

  return (
    <svg
      data-slot="hexagon-diagram"
      viewBox={`0 0 ${HEXAGON_WIDTH} ${HEXAGON_HEIGHT}`}
      role="group"
      aria-label={label}
      className={cn('block h-auto w-full', className)}
    >
      {[...rings].reverse().map((ring, reversed) => {
        const index = rings.length - 1 - reversed;
        const radius = ringRadius(index, rings.length);
        return (
          <g key={ring.id} data-slot="hexagon-ring" data-ring={ring.id}>
            <polygon
              points={hexagonPoints(radius)}
              className={cn(
                '[stroke-width:1.5]',
                RING_FILL[Math.min(index, RING_FILL.length - 1)],
              )}
            />
            <text
              x={HEXAGON_CENTRE.x}
              y={ringLabelY(radius)}
              className="fill-(--color-content-muted) text-[11px] tracking-[0.12em] uppercase [text-anchor:middle]"
            >
              {ring.label}
            </text>
          </g>
        );
      })}
      {edges.map(edge => {
        const [from, to] = [byId.get(edge.from), byId.get(edge.to)];
        if (from === undefined || to === undefined) return null;
        const [a, b] = [position(from), position(to)];
        return (
          <line
            key={`${edge.from}>${edge.to}`}
            data-slot="hexagon-edge"
            data-travelled={edge.travelled ? '' : undefined}
            data-dim={edge.dim ? '' : undefined}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            className={EDGE}
          />
        );
      })}
      {nodes.map(node => {
        const { x, y } = position(node);
        const width = nodeWidth(node.label);
        return (
          <g
            key={node.id}
            data-slot="hexagon-node"
            data-ring={node.ring}
            data-state={node.state}
            role="button"
            tabIndex={0}
            aria-label={node.label}
            aria-pressed={node.id === selected}
            onClick={() => choose(node.id)}
            onKeyDown={key(node.id)}
            className={NODE}
          >
            <rect
              x={x - width / 2}
              y={y - NODE_HEIGHT / 2}
              width={width}
              height={NODE_HEIGHT}
              rx={NODE_HEIGHT / 2}
              className={PILL}
            />
            <text x={x} y={y + 4.5} className={NODE_TEXT}>
              {node.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
