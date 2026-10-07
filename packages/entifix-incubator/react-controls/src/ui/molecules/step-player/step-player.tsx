'use client';

import { button, cn } from '@entifix/react-controls/primitives';
import { useEffect, useState } from 'react';

export interface StepPlayerCopy {
  /** "Step {{n}} of {{count}}", its numbers as placeholders. */
  readonly step: string;
  readonly previous: string;
  readonly next: string;
  readonly play: string;
  readonly pause: string;
  readonly restart: string;
}

export interface StepPlayerProps {
  /** How many steps there are. */
  readonly count: number;
  /** The step shown, from 0. */
  readonly index: number;
  /** Told which step to show. */
  readonly onIndex: (index: number) => void;
  /** Steps where things go wrong: their mark on the track is the danger colour. */
  readonly failing?: readonly number[];
  /** How long a step shows while playing, in milliseconds. */
  readonly interval?: number;
  readonly copy: StepPlayerCopy;
  readonly className?: string;
}

const ICONS = {
  previous: 'M15 6 9 12l6 6',
  next: 'm9 6 6 6-6 6',
  play: 'M8 5.5v13l10.5-6.5L8 5.5Z',
  pause: 'M8.5 5.5v13M15.5 5.5v13',
  restart: 'M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4.5v4h4',
} as const;

function Icon({ name }: { name: keyof typeof ICONS }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-[1.1em] fill-none stroke-current [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:2]"
    >
      <path d={ICONS[name]} />
    </svg>
  );
}

const TRACK =
  'h-[3px] flex-1 rounded-full bg-(--color-border) data-done:bg-(--color-primary) data-done:data-failing:bg-(--color-danger)';

/**
 * Previous, next and play over a sequence of steps, with a track that marks
 * how far it has gone. Playing moves a step every `interval` until the last,
 * then offers to restart; pressing previous or next stops it.
 *
 * The page keeps which step is shown; the player keeps only whether it is
 * playing. Parts carry `data-slot` (`step-player`, `step-player-count`,
 * `step-player-track`).
 */
export function StepPlayer({
  count,
  index,
  onIndex,
  failing = [],
  interval = 2600,
  copy,
  className,
}: StepPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const last = count - 1;

  useEffect(() => {
    if (!playing) return;
    if (index >= last) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(() => onIndex(index + 1), interval);
    return () => clearTimeout(timer);
  }, [playing, index, last, interval, onIndex]);

  const go = (to: number) => {
    setPlaying(false);
    onIndex(to);
  };
  const toggle = () => {
    if (index === last) onIndex(0);
    setPlaying(!playing);
  };
  const quiet = button({ variant: 'secondary', size: 'sm' });
  const action = playing ? 'pause' : index === last ? 'restart' : 'play';

  return (
    <div
      data-slot="step-player"
      className={cn('flex flex-col gap-2xs', className)}
    >
      <div className="flex flex-wrap items-center gap-2xs">
        <span
          data-slot="step-player-count"
          className="me-auto text-step-sm text-content-muted"
        >
          {copy.step
            .replace('{{n}}', String(index + 1))
            .replace('{{count}}', String(count))}
        </span>
        <button
          type="button"
          className={quiet}
          aria-label={copy.previous}
          disabled={index === 0}
          onClick={() => go(index - 1)}
        >
          <Icon name="previous" />
        </button>
        <button
          type="button"
          className={quiet}
          aria-label={copy.next}
          disabled={index === last}
          onClick={() => go(index + 1)}
        >
          <Icon name="next" />
        </button>
        <button
          type="button"
          className={cn(quiet, 'gap-3xs')}
          aria-pressed={playing}
          onClick={toggle}
        >
          <Icon name={action} />
          {copy[action]}
        </button>
      </div>
      <ol
        data-slot="step-player-track"
        aria-hidden="true"
        className="m-0 flex list-none gap-3xs p-0"
      >
        {Array.from({ length: count }, (_, step) => (
          <li
            key={step}
            data-done={step <= index ? '' : undefined}
            data-failing={failing.includes(step) ? '' : undefined}
            className={TRACK}
          />
        ))}
      </ol>
    </div>
  );
}
