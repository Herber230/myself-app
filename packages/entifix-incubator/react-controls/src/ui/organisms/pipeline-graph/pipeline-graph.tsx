'use client';

import { cn } from '@entifix/react-controls/primitives';
import { type KeyboardEvent, useId } from 'react';

import {
  arrowPath,
  columnX,
  JOB_HEIGHT,
  JOB_WIDTH,
  jobY,
  pipelineSize,
  type PipelineSlot,
  reduceEdges,
  STAGE_LABEL_Y,
} from './layout.js';

/** How a job is drawn: run by a step, failing at one, or not run. */
export type PipelineJobState = 'lit' | 'fails' | 'dim';

export interface PipelineGraphStage {
  readonly id: string;
  readonly label: string;
}

export interface PipelineGraphJob {
  readonly id: string;
  readonly label: string;
  /** Its stage's id. */
  readonly stage: string;
  readonly state?: PipelineJobState;
}

export interface PipelineGraphProps {
  /** Left to right. */
  readonly stages: readonly PipelineGraphStage[];
  /** In their order within each stage. */
  readonly jobs: readonly PipelineGraphJob[];
  /** One per wait: `from` must finish before `to` starts. */
  readonly needs: readonly { readonly from: string; readonly to: string }[];
  readonly selected?: string;
  readonly onSelect?: (id: string) => void;
  /** The picture's accessible name. */
  readonly label: string;
  readonly className?: string;
}

const JOB =
  'cursor-pointer outline-none transition-opacity duration-200 data-[state=dim]:opacity-[0.3] motion-reduce:transition-none';

const BOX =
  'fill-(--color-surface) stroke-(--color-border) [stroke-width:1.5] transition-[fill,stroke] duration-200 motion-reduce:transition-none [[data-slot=pipeline-job]:hover_&]:stroke-(--color-primary) [[data-slot=pipeline-job]:focus-visible_&]:stroke-(--color-primary) [[aria-pressed=true]_&]:stroke-(--color-primary) [[data-state=lit]_&]:fill-(--color-primary) [[data-state=lit]_&]:stroke-(--color-primary) [[data-state=fails]_&]:fill-(--color-danger) [[data-state=fails]_&]:stroke-(--color-danger)';

const TEXT =
  'pointer-events-none fill-(--color-content) font-mono text-[12px] [text-anchor:middle] [[data-state=lit]_&]:fill-(--color-primary-content) [[data-state=lit]_&]:font-semibold [[data-state=fails]_&]:fill-(--color-danger-content)';

const ARROW =
  'fill-none stroke-[color-mix(in_srgb,var(--color-content)_30%,transparent)] [stroke-width:1.5] transition-[stroke,opacity] duration-200 data-lit:stroke-(--color-primary) data-lit:[stroke-width:2] data-dim:opacity-[0.3] motion-reduce:transition-none';

/**
 * A delivery pipeline: a column per stage, left to right, a box per job, and
 * an arrow per wait — only those no longer path implies, so a fan of checks
 * into a gate reads as one. A job a step runs is filled, one it fails at is
 * the danger colour, one it skips is faint; an arrow between two jobs run is
 * lit.
 *
 * It holds no state: the page says what is run and chosen. Each job is a
 * button (Enter or Space chooses it). Parts carry `data-slot`
 * (`pipeline-graph`, `pipeline-stage`, `pipeline-arrow`, `pipeline-job`).
 */
export function PipelineGraph({
  stages,
  jobs,
  needs,
  selected,
  onSelect,
  label,
  className,
}: PipelineGraphProps) {
  const id = useId();
  const slots = new Map<string, PipelineSlot>();
  stages.forEach((stage, column) => {
    const inStage = jobs.filter(job => job.stage === stage.id);
    inStage.forEach((job, row) =>
      slots.set(job.id, { column, row, rows: inStage.length }),
    );
  });
  const tallest = Math.max(1, ...[...slots.values()].map(slot => slot.rows));
  const { width, height } = pipelineSize(stages.length, tallest);
  const stateOf = new Map(jobs.map(job => [job.id, job.state]));
  const arrowHead = `${id}-head`;
  const key = (job: string) => (event: KeyboardEvent<SVGGElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    onSelect?.(job);
  };

  return (
    <svg
      data-slot="pipeline-graph"
      viewBox={`0 0 ${width} ${height}`}
      role="group"
      aria-label={label}
      className={cn('block h-auto w-full', className)}
    >
      <defs>
        <marker
          id={arrowHead}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path
            d="M0 0L10 5L0 10z"
            className="fill-[color-mix(in_srgb,var(--color-content)_45%,transparent)]"
          />
        </marker>
      </defs>
      {stages.map((stage, index) => (
        <text
          key={stage.id}
          data-slot="pipeline-stage"
          x={columnX(index)}
          y={STAGE_LABEL_Y}
          className="fill-(--color-content-muted) text-[11px] tracking-[0.1em] uppercase [text-anchor:middle]"
        >
          {stage.label}
        </text>
      ))}
      {reduceEdges(needs).map(({ from, to }) => {
        const [a, b] = [slots.get(from), slots.get(to)];
        if (a === undefined || b === undefined) return null;
        const [sa, sb] = [stateOf.get(from), stateOf.get(to)];
        return (
          <path
            key={`${from}>${to}`}
            data-slot="pipeline-arrow"
            data-lit={
              sa !== undefined &&
              sa !== 'dim' &&
              sb !== undefined &&
              sb !== 'dim'
                ? ''
                : undefined
            }
            data-dim={sa === 'dim' || sb === 'dim' ? '' : undefined}
            d={arrowPath(a, b, tallest)}
            markerEnd={`url(#${arrowHead})`}
            className={ARROW}
          />
        );
      })}
      {jobs.map(job => {
        const slot = slots.get(job.id);
        if (slot === undefined) return null;
        const x = columnX(slot.column);
        const y = jobY(slot, tallest);
        return (
          <g
            key={job.id}
            data-slot="pipeline-job"
            data-state={job.state}
            role="button"
            tabIndex={0}
            aria-label={job.label}
            aria-pressed={job.id === selected}
            onClick={() => onSelect?.(job.id)}
            onKeyDown={key(job.id)}
            className={JOB}
          >
            <rect
              x={x - JOB_WIDTH / 2}
              y={y}
              width={JOB_WIDTH}
              height={JOB_HEIGHT}
              rx={8}
              className={BOX}
            />
            <text x={x} y={y + JOB_HEIGHT / 2 + 4.5} className={TEXT}>
              {job.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
