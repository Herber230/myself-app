import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  DecisionTimeline,
  type TimelineDecision,
} from './decision-timeline.js';

const decision = (
  number: string,
  date: string,
  dayLabel: string,
  supersedes: string[] = [],
): TimelineDecision => ({
  id: `p-${number}`,
  number,
  title: `Record ${number}`,
  status: supersedes.length > 0 ? 'accepted' : 'superseded',
  statusLabel: 'Accepted',
  date,
  dateLabel: date,
  dayLabel,
  supersedes,
});

const DECISIONS = [
  decision('0003', '2026-09-18', 'Sep 18', ['p-0001', 'p-gone']),
  decision('0001', '2026-09-17', 'Sep 17'),
  decision('0002', '2026-09-17', 'Sep 17'),
  decision('0004', '2026-09-19', 'Sep 19'),
  decision('0005', '2026-09-30', 'Sep 30'),
];

function renderLine(kept?: ReadonlySet<string>, onSelect = vi.fn()) {
  const view = render(
    <DecisionTimeline
      label="Timeline"
      decisions={DECISIONS}
      kept={kept}
      selected="p-0002"
      onSelect={onSelect}
    />,
  );
  return { ...view, onSelect };
}

const dots = () =>
  screen
    .getAllByRole('button')
    .map(button => button.getAttribute('aria-label'));

describe('the decision timeline', () => {
  it('places the records in the order they were decided', () => {
    renderLine();
    expect(screen.getByRole('group', { name: 'Timeline' })).toBeTruthy();
    expect(dots()).toEqual([
      '0001 · Record 0001 (Accepted, 2026-09-17)',
      '0002 · Record 0002 (Accepted, 2026-09-17)',
      '0003 · Record 0003 (Accepted, 2026-09-18)',
      '0004 · Record 0004 (Accepted, 2026-09-19)',
      '0005 · Record 0005 (Accepted, 2026-09-30)',
    ]);
  });

  it('marks the chosen record, and chooses another on a click', () => {
    const { onSelect } = renderLine();
    const buttons = screen.getAllByRole('button');
    expect(buttons[1]?.getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(buttons[4] as HTMLElement);
    expect(onSelect).toHaveBeenCalledWith('p-0005');
  });

  it('draws an arc to each record superseded, and none to one it lacks', () => {
    const { container } = renderLine();
    expect(container.querySelectorAll('svg path')).toHaveLength(1);
  });

  it('names a day where it changes, when there is room', () => {
    const { container } = renderLine();
    expect(
      [...container.querySelectorAll('.adr-timeline-tick')].map(
        tick => tick.textContent,
      ),
    ).toEqual(['Sep 17', 'Sep 19']);
  });

  it('dims what a filter leaves out', () => {
    const { container } = renderLine(new Set(['p-0001']));
    expect(container.querySelectorAll('[data-dimmed]')).toHaveLength(4);
  });

  it('brings the chosen dot to the middle of a line wider than its room', () => {
    vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(1000);
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(300);
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      function (this: HTMLElement) {
        return (
          this.getAttribute('aria-pressed') === 'true'
            ? { left: 700, width: 14 }
            : { left: 0, width: 300 }
        ) as DOMRect;
      },
    );
    renderLine();
    const line = screen.getByRole('group', { name: 'Timeline' });
    // The dot's middle, 707, to the line's, 150.
    expect(line.scrollLeft).toBe(557);
    vi.restoreAllMocks();
  });

  it('moves nothing with no record chosen', () => {
    render(
      <DecisionTimeline
        label="Timeline"
        decisions={DECISIONS}
        kept={undefined}
        selected={undefined}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByRole('group', { name: 'Timeline' }).scrollLeft).toBe(0);
  });
});
