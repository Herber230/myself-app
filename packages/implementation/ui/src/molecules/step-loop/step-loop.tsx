import type { CSSProperties } from 'react';

export interface LoopStep {
  readonly key: string;
  readonly label: string;
  /** A 24×24 line drawing's path, stroked in `currentColor`. */
  readonly icon: string;
}

/**
 * Steps joined by a line and lit one after another, round and round, as work
 * that repeats is done: a spark runs along the line to the next. Pointed at,
 * it holds still; under reduced motion it never moves. One under another in
 * a narrow container. Its timing is drawn for four steps: each is lit for a
 * quarter of the round.
 */
export function StepLoop({
  label,
  steps,
}: {
  /** Names the list: "How an agent uses the records". */
  label: string;
  steps: readonly LoopStep[];
}) {
  return (
    <div
      className="step-loop"
      style={{ '--loop-steps': steps.length } as CSSProperties}
    >
      <ol className="step-loop-list" aria-label={label}>
        {steps.map((step, index) => (
          <li
            key={step.key}
            className="step-loop-step"
            style={{ '--step': index } as CSSProperties}
          >
            <svg
              className="step-loop-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d={step.icon} />
            </svg>
            <span className="step-loop-name">{step.label}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
