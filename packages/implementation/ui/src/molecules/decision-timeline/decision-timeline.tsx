/**
 * A project's decision records along a line (#77): one dot per record in the
 * order they were decided, coloured by status, with an arc from each record
 * to one it supersedes. Evenly spaced rather than to scale, since records
 * share days; a tick names the day where it changes, when there is room.
 *
 * Each dot is a button that chooses its record. The records a filter leaves
 * out stay on the line, dimmed, so the history keeps its shape.
 */

/** One record as a dot shows it, translated at build. */
export interface TimelineDecision {
  readonly id: string;
  readonly number: string;
  readonly title: string;
  readonly status: string;
  readonly statusLabel: string;
  /** ISO, to order by. */
  readonly date: string;
  readonly dateLabel: string;
  /** The day, short, for a tick: `Sep 17`. */
  readonly dayLabel: string;
  /** The ids of the records it supersedes. */
  readonly supersedes: readonly string[];
}

/** The distance between two dots, in pixels. */
export const TIMELINE_STEP = 28;
/** How many steps apart two ticks must be to both show. */
const TICK_GAP = 3;
/** Where the line runs, from the top; arcs rise above it. */
const LINE_Y = 44;

const centre = (index: number) => (index + 0.5) * TIMELINE_STEP;

/** An arc between two dots, higher the further apart they are. */
function arcPath(from: number, to: number) {
  const [a, b] = [centre(from), centre(to)];
  const height = Math.min(LINE_Y - 6, 10 + Math.abs(b - a) * 0.2);
  return `M${a} ${LINE_Y}Q${(a + b) / 2} ${LINE_Y - height * 2} ${b} ${LINE_Y}`;
}

export function DecisionTimeline({
  label,
  decisions,
  kept,
  selected,
  onSelect,
}: {
  label: string;
  decisions: readonly TimelineDecision[];
  /** The ids a filter keeps, or `undefined` while every record is shown. */
  kept: ReadonlySet<string> | undefined;
  selected: string | undefined;
  onSelect: (id: string) => void;
}) {
  const ordered = [...decisions].sort(
    (a, b) => a.date.localeCompare(b.date) || a.number.localeCompare(b.number),
  );
  const at = new Map(ordered.map((decision, index) => [decision.id, index]));
  const arcs = ordered.flatMap((decision, index) =>
    decision.supersedes.flatMap(target => {
      const to = at.get(target);
      return to === undefined
        ? []
        : [{ key: `${decision.id}>${target}`, d: arcPath(index, to) }];
    }),
  );
  let lastTick = -TICK_GAP;
  const ticks = ordered.map((decision, index) => {
    const changed =
      index === 0 || ordered[index - 1]?.dayLabel !== decision.dayLabel;
    if (!changed || index - lastTick < TICK_GAP) return undefined;
    lastTick = index;
    return decision.dayLabel;
  });
  const width = ordered.length * TIMELINE_STEP;

  return (
    <div className="adr-timeline" role="group" aria-label={label}>
      <div className="adr-timeline-track" style={{ width }}>
        <svg
          aria-hidden="true"
          className="adr-timeline-arcs"
          width={width}
          height={LINE_Y + 1}
          viewBox={`0 0 ${width} ${LINE_Y + 1}`}
        >
          <line x1={0} y1={LINE_Y} x2={width} y2={LINE_Y} />
          {arcs.map(arc => (
            <path key={arc.key} d={arc.d} />
          ))}
        </svg>
        <ol className="adr-timeline-dots">
          {ordered.map((decision, index) => {
            const name = `${decision.number} · ${decision.title} (${decision.statusLabel}, ${decision.dateLabel})`;
            return (
              <li key={decision.id}>
                <button
                  type="button"
                  className="adr-timeline-dot"
                  data-status={decision.status}
                  data-dimmed={
                    kept !== undefined && !kept.has(decision.id)
                      ? ''
                      : undefined
                  }
                  aria-pressed={decision.id === selected}
                  aria-label={name}
                  title={name}
                  onClick={() => onSelect(decision.id)}
                />
                {ticks[index] !== undefined && (
                  <span className="adr-timeline-tick" aria-hidden="true">
                    {ticks[index]}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
