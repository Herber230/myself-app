/**
 * Where a pipeline's jobs sit, in the picture's own units: one column per
 * stage, left to right, its jobs stacked and centred on the tallest column.
 */

export const COLUMN_WIDTH = 176;
export const JOB_WIDTH = 150;
export const JOB_HEIGHT = 34;
const ROW = 46;
const HEADER = 34;
const PADDING = 14;

export interface PipelineSlot {
  readonly column: number;
  readonly row: number;
  /** How many jobs share its column. */
  readonly rows: number;
}

export interface PipelineSize {
  readonly width: number;
  readonly height: number;
}

export function pipelineSize(columns: number, tallest: number): PipelineSize {
  return {
    width: columns * COLUMN_WIDTH,
    height: HEADER + tallest * ROW + PADDING,
  };
}

/** A column's centre. */
export function columnX(column: number): number {
  return column * COLUMN_WIDTH + COLUMN_WIDTH / 2;
}

/** The y of a stage's name, above its column. */
export const STAGE_LABEL_Y = 20;

/** A job's top edge, its column centred on the tallest. */
export function jobY(slot: PipelineSlot, tallest: number): number {
  const offset = ((tallest - slot.rows) * ROW) / 2;
  return HEADER + offset + slot.row * ROW + (ROW - JOB_HEIGHT) / 2;
}

/**
 * An arrow from the job that must finish to the one that waits for it: down
 * a column, or across from one column's right edge to the next's left.
 */
export function arrowPath(
  from: PipelineSlot,
  to: PipelineSlot,
  tallest: number,
): string {
  const [x1, x2] = [columnX(from.column), columnX(to.column)];
  const [y1, y2] = [jobY(from, tallest), jobY(to, tallest)];
  if (from.column === to.column) {
    const down = to.row > from.row;
    const start = down ? y1 + JOB_HEIGHT : y1;
    const end = down ? y2 : y2 + JOB_HEIGHT;
    return `M${x1} ${start}L${x2} ${end}`;
  }
  const start = { x: x1 + JOB_WIDTH / 2, y: y1 + JOB_HEIGHT / 2 };
  const end = { x: x2 - JOB_WIDTH / 2, y: y2 + JOB_HEIGHT / 2 };
  const middle = (start.x + end.x) / 2;
  return `M${start.x} ${start.y}C${middle} ${start.y} ${middle} ${end.y} ${end.x} ${end.y}`;
}

/**
 * The edges no longer path already implies (a transitive reduction): a job
 * that needs both a check and the setup the check needs draws only the
 * check's arrow.
 */
export function reduceEdges<TEdge extends { from: string; to: string }>(
  edges: readonly TEdge[],
): TEdge[] {
  const next = new Map<string, string[]>();
  for (const { from, to } of edges) {
    next.set(from, [...(next.get(from) ?? []), to]);
  }
  const reaches = (start: string, goal: string, skip: TEdge): boolean => {
    const seen = new Set<string>();
    const stack = [start];
    while (stack.length > 0) {
      const at = stack.pop() as string;
      for (const to of next.get(at) ?? []) {
        if (at === skip.from && to === skip.to) continue;
        if (to === goal) return true;
        if (!seen.has(to)) {
          seen.add(to);
          stack.push(to);
        }
      }
    }
    return false;
  };
  return edges.filter(edge => !reaches(edge.from, edge.to, edge));
}
