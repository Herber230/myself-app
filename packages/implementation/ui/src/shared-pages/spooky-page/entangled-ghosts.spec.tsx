import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { EntangledGhosts } from './entangled-ghosts.js';

const ghost = (name: 'A' | 'B') =>
  screen.getByRole('button', { name: `Look at Ghost ${name}` });

/** Looks at a ghost, with the coin landing on the given side. */
function look(name: 'A' | 'B', coin: number) {
  vi.spyOn(Math, 'random').mockReturnValue(coin);
  fireEvent.click(ghost(name));
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('the entangled ghosts', () => {
  it('starts with both ghosts undecided, asking to be tapped', () => {
    render(<EntangledGhosts />);
    expect(ghost('A').dataset.state).toBe('both');
    expect(ghost('B').dataset.state).toBe('both');
    expect(screen.getAllByText('Both at once')).toHaveLength(2);
    expect(screen.getByText('Tap a ghost to look at it')).toBeTruthy();
    expect(
      screen.getByText('Nobody has looked yet: both are still undecided.'),
    ).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Entangle them again' })).toBe(
      null,
    );
  });

  it('settles the twin opposite to the ghost looked at', () => {
    render(<EntangledGhosts />);
    look('A', 0.1);
    expect(ghost('A').dataset.state).toBe('pumpkin');
    expect(ghost('B').dataset.state).toBe('ghost');
    expect(
      screen.getByText(
        'You looked at Ghost A: pumpkin. So Ghost B, light-years away, is a ghost.',
      ),
    ).toBeTruthy();
    expect(
      screen.getByText(
        'Looked 1 time. Ghost A came out a pumpkin 1 and a ghost 0: chance. The two disagreed 1 out of 1: never chance.',
      ),
    ).toBeTruthy();
    // A measured pair is not measured again until it is entangled again.
    expect((ghost('A') as HTMLButtonElement).disabled).toBe(true);
    expect((ghost('B') as HTMLButtonElement).disabled).toBe(true);
  });

  it('entangles the pair again, keeping the tally', () => {
    render(<EntangledGhosts />);
    look('A', 0.9);
    expect(ghost('A').dataset.state).toBe('ghost');
    fireEvent.click(
      screen.getByRole('button', { name: 'Entangle them again' }),
    );
    expect(ghost('A').dataset.state).toBe('both');
    look('B', 0.9);
    expect(ghost('B').dataset.state).toBe('ghost');
    expect(ghost('A').dataset.state).toBe('pumpkin');
    expect(
      screen.getByText(
        'You looked at Ghost B: ghost. So Ghost A, light-years away, is a pumpkin.',
      ),
    ).toBeTruthy();
    expect(
      screen.getByText(
        'Looked 2 times. Ghost A came out a pumpkin 1 and a ghost 1: chance. The two disagreed 2 out of 2: never chance.',
      ),
    ).toBeTruthy();
  });
});
