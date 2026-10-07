import { describe, expect, it } from 'vitest';

import {
  arrowPath,
  COLUMN_WIDTH,
  columnX,
  JOB_HEIGHT,
  JOB_WIDTH,
  jobY,
  pipelineSize,
  reduceEdges,
} from './layout';

describe("the pipeline graph's layout", () => {
  it('is a column per stage, as tall as the tallest', () => {
    expect(pipelineSize(3, 2).width).toBe(3 * COLUMN_WIDTH);
    expect(pipelineSize(3, 4).height).toBeGreaterThan(
      pipelineSize(3, 2).height,
    );
    expect(columnX(1) - columnX(0)).toBe(COLUMN_WIDTH);
  });

  it('centres a short column on the tallest', () => {
    const lone = jobY({ column: 0, row: 0, rows: 1 }, 3);
    const middle = jobY({ column: 1, row: 1, rows: 3 }, 3);
    expect(lone).toBe(middle);
  });

  it('draws a wait down a column, or up it', () => {
    const first = { column: 0, row: 0, rows: 2 };
    const second = { column: 0, row: 1, rows: 2 };
    expect(arrowPath(first, second, 2)).toBe(
      `M${columnX(0)} ${jobY(first, 2) + JOB_HEIGHT}L${columnX(0)} ${jobY(second, 2)}`,
    );
    expect(arrowPath(second, first, 2)).toBe(
      `M${columnX(0)} ${jobY(second, 2)}L${columnX(0)} ${jobY(first, 2) + JOB_HEIGHT}`,
    );
  });

  it('draws one across, from a right edge to the next left edge', () => {
    const from = { column: 0, row: 0, rows: 1 };
    const to = { column: 1, row: 0, rows: 1 };
    expect(arrowPath(from, to, 1)).toMatch(
      new RegExp(
        `^M${columnX(0) + JOB_WIDTH / 2} .*${columnX(1) - JOB_WIDTH / 2} [0-9.]+$`,
      ),
    );
  });

  it('keeps only the waits no longer path implies', () => {
    const edges = [
      { from: 'setup', to: 'lint' },
      { from: 'setup', to: 'test' },
      { from: 'lint', to: 'gate' },
      { from: 'test', to: 'gate' },
      { from: 'setup', to: 'gate' },
    ];
    expect(reduceEdges(edges)).toEqual(edges.slice(0, 4));
  });

  it('walks a diamond once, and keeps a lone edge', () => {
    // `gate` is reached twice on the way to `deploy`, so it is walked once.
    const edges = [
      { from: 'a', to: 'b' },
      { from: 'a', to: 'c' },
      { from: 'b', to: 'gate' },
      { from: 'c', to: 'gate' },
      { from: 'gate', to: 'deploy' },
      { from: 'a', to: 'deploy' },
      { from: 'x', to: 'y' },
    ];
    expect(reduceEdges(edges)).toEqual([...edges.slice(0, 5), edges[6]]);
  });
});
