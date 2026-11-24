import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { OneMonthStory } from './one-month-story.js';

const CARDS = [
  'Cover',
  'The plan',
  'Some things came up',
  'The thought',
  'The clumsy ask',
  'Yes',
  'The salsa night',
  'Count with me',
  'Closing',
] as const;

function setup() {
  const { container } = render(<OneMonthStory />);
  const stage = container.querySelector('.month-stage') as HTMLElement;
  const shown = () =>
    container.querySelector('section[data-active]')?.getAttribute('aria-label');
  const mood = () => stage.dataset.mood;
  /** A tap on the right side (jsdom's window is 1024 wide). */
  const forward = () => fireEvent.click(stage, { clientX: 900 });
  const back = () => fireEvent.click(stage, { clientX: 100 });
  const hint = () => container.querySelector('.month-hint');
  return { container, stage, shown, mood, forward, back, hint };
}

/** Walks from the cover to the count, tapping on. */
function toCount(forward: () => void) {
  for (let n = 0; n < 7; n++) forward();
}

describe('the one-month story', () => {
  it('opens on the cover, in the night, with every card but it hidden', () => {
    const { container, shown, mood, hint } = setup();
    expect(shown()).toBe('Cover');
    expect(mood()).toBe('night');
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
      'Hi Spooky.',
    );
    const sections = [...container.querySelectorAll('section')];
    expect(sections.map(section => section.getAttribute('aria-label'))).toEqual(
      [...CARDS],
    );
    expect(
      sections.filter(
        section => section.getAttribute('aria-hidden') === 'true',
      ),
    ).toHaveLength(CARDS.length - 1);
    expect(hint()?.textContent).toBe(
      'Tap the right side to go on · the left to go back',
    );
    expect(hint()?.querySelector('.month-hint-arrow')).toBe(null);
  });

  it('goes on by a tap on the right, and back by one on the left', () => {
    const { container, shown, forward, back, hint } = setup();
    forward();
    expect(shown()).toBe('The plan');
    expect(hint()?.textContent).toBe('Tap to continue');
    expect(hint()?.querySelector('.month-hint-arrow')).not.toBe(null);
    expect(
      container.querySelectorAll('.month-progress [data-done]'),
    ).toHaveLength(2);
    back();
    expect(shown()).toBe('Cover');
    // Nothing before the cover.
    back();
    expect(shown()).toBe('Cover');
  });

  it('warms up from the salsa night on', () => {
    const { shown, mood, forward } = setup();
    for (let n = 0; n < 6; n++) forward();
    expect(shown()).toBe('The salsa night');
    expect(mood()).toBe('warm');
  });

  it('moves on from the count by its own button only', () => {
    const { shown, forward, hint } = setup();
    toCount(forward);
    expect(shown()).toBe('Count with me');
    expect(hint()).toBe(null);
    forward();
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(shown()).toBe('Count with me');
    // A tap on the drum is the drum's, not the story's.
    for (let n = 0; n < 8; n++)
      fireEvent.click(screen.getByRole('button', { name: /^(Tap|pause|\d)$/ }));
    expect(shown()).toBe('Count with me');
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(shown()).toBe('Closing');
  });

  it('ends on the closing card, which starts again by its button', () => {
    const { shown, forward } = setup();
    toCount(forward);
    for (let n = 0; n < 8; n++)
      fireEvent.click(screen.getByRole('button', { name: /^(Tap|pause|\d)$/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    forward();
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(shown()).toBe('Closing');
    expect(screen.getByText('Happy one month, Spooky.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Start again' }));
    expect(shown()).toBe('Cover');
  });

  it('counts afresh each time the count is reached', () => {
    const { shown, forward, back } = setup();
    toCount(forward);
    for (let n = 0; n < 8; n++)
      fireEvent.click(screen.getByRole('button', { name: /^(Tap|pause|\d)$/ }));
    expect(screen.getByRole('button', { name: 'Continue' })).toBeTruthy();
    back();
    expect(shown()).toBe('The salsa night');
    forward();
    expect(shown()).toBe('Count with me');
    expect(screen.queryByRole('button', { name: 'Continue' })).toBe(null);
    expect(screen.getByRole('button', { name: 'Tap' })).toBeTruthy();
  });

  it('follows the arrow keys, and ignores other keys', () => {
    const { shown } = setup();
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(shown()).toBe('The plan');
    fireEvent.keyDown(window, { key: 'Enter' });
    expect(shown()).toBe('The plan');
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(shown()).toBe('Cover');
  });

  it('stops listening to the keys once gone', () => {
    const { container, unmount } = render(<OneMonthStory />);
    unmount();
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(container.querySelector('section')).toBe(null);
  });

  it('crosses out the drafts before the question', () => {
    const { container } = setup();
    const drafts = [...container.querySelectorAll('s.month-draft')];
    expect(drafts.map(draft => draft.textContent)).toEqual([
      'So… about that date—',
      'What if we—',
    ]);
    expect(screen.getByText('Would you be my girlfriend?')).toBeTruthy();
  });
});
