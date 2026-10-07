import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { type PathState, StatePath } from './state-path.js';

const STATES: PathState[] = [
  {
    key: 'draft',
    label: 'Draft',
    count: 0,
    countLabel: ', 0',
    panel: <p>Nothing drafted.</p>,
  },
  {
    key: 'live',
    label: 'Live',
    count: 3,
    countLabel: ', 3',
    panel: <p>Three live.</p>,
  },
];

function path(initial = 'live') {
  return render(
    <StatePath
      name="phase"
      legend="The phases"
      hint="Pick a phase"
      initial={initial}
      states={STATES}
    />,
  );
}

describe('states on a path', () => {
  it('is a group of radio buttons, one per state, named with its count', () => {
    path();
    const group = screen.getByRole('group', { name: 'The phases' });
    const radios = within(group).getAllByRole('radio');
    expect(radios.map(radio => radio.getAttribute('name'))).toEqual([
      'phase',
      'phase',
    ]);
    expect(screen.getByRole('radio', { name: 'Live, 3' })).toHaveProperty(
      'checked',
      true,
    );
    expect(screen.getByText('Pick a phase')).toBeTruthy();
  });

  it('draws an empty state dashed, and knows how many states it has', () => {
    const { container } = path();
    const [draft, live] = container.querySelectorAll('.state-path-state');
    expect(draft?.hasAttribute('data-empty')).toBe(true);
    expect(live?.hasAttribute('data-empty')).toBe(false);
    expect(
      (container.firstElementChild as HTMLElement).style.getPropertyValue(
        '--path-states',
      ),
    ).toBe('2');
  });

  it('holds a panel per state, each knowing where its caret points', () => {
    const { container } = path();
    const panels = [...container.querySelectorAll('.state-path-panel')];
    expect(panels.map(panel => panel.textContent)).toEqual([
      'Nothing drafted.',
      'Three live.',
    ]);
    expect(
      panels.map(panel =>
        (panel as HTMLElement).style.getPropertyValue('--at'),
      ),
    ).toEqual(['0', '1']);
  });

  it('is chosen by the reader, the browser keeping the choice', () => {
    path('draft');
    expect(screen.getByRole('radio', { name: 'Draft, 0' })).toHaveProperty(
      'checked',
      true,
    );
    fireEvent.click(screen.getByRole('radio', { name: 'Live, 3' }));
    expect(screen.getByRole('radio', { name: 'Live, 3' })).toHaveProperty(
      'checked',
      true,
    );
  });
});
