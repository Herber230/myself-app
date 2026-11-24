import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SalsaCount } from './salsa-count.js';

/** An audio param that only records what it is asked. */
const param = () => ({
  setValueAtTime: vi.fn(),
  exponentialRampToValueAtTime: vi.fn(),
});

/** Enough of `AudioContext` to play a tone, counting the tones played. */
function fakeAudio() {
  const tones: number[] = [];
  const created = vi.fn();
  class FakeAudioContext {
    currentTime = 0;
    destination = {};
    constructor() {
      created();
    }
    createGain() {
      return { gain: param(), connect: (next: unknown) => next };
    }
    createOscillator() {
      const frequency = param();
      return {
        type: '',
        frequency,
        connect: (next: unknown) => next,
        start: () => {
          const [pitch] = frequency.exponentialRampToValueAtTime.mock
            .calls[0] as [number, number];
          tones.push(pitch);
        },
        stop: vi.fn(),
      };
    }
  }
  vi.stubGlobal('AudioContext', FakeAudioContext);
  return { tones, created };
}

const drum = () => screen.getByRole('button', { name: /^(Tap|pause|\d)$/ });
const tap = (times = 1) => {
  for (let n = 0; n < times; n++) fireEvent.click(drum());
};
const lit = (container: HTMLElement) =>
  [...container.querySelectorAll('.month-beat[data-on]')].map(
    beat => beat.textContent,
  );

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('the salsa count', () => {
  it('explains the count and waits for the first tap', () => {
    const { container } = render(<SalsaCount onDone={() => undefined} />);
    expect(
      screen.getByText(
        'Salsa is counted in eights: three steps, then a pause, and again.',
      ),
    ).toBeTruthy();
    expect(
      screen.getByText('🔊 Sound on, and on an iPhone, the silent switch off.'),
    ).toBeTruthy();
    expect(drum().textContent).toBe('Tap');
    expect(drum().hasAttribute('data-waiting')).toBe(true);
    expect(screen.getByText('Tap the drum to count with me')).toBeTruthy();
    expect(lit(container)).toEqual([]);
    const pauses = [...container.querySelectorAll('.month-beat[data-pause]')];
    expect(pauses.map(beat => beat.textContent)).toEqual(['4', '8']);
  });

  it('plays a conga on the steps, higher on 3 and 7, and none on the pauses', () => {
    const { tones, created } = fakeAudio();
    const { container } = render(<SalsaCount onDone={() => undefined} />);
    tap(3);
    expect(drum().textContent).toBe('3');
    expect(screen.getByText('Keep going…')).toBeTruthy();
    expect(lit(container)).toEqual(['1', '2', '3']);
    tap();
    expect(drum().textContent).toBe('pause');
    expect(drum().hasAttribute('data-rest')).toBe(true);
    tap(4);
    expect(tones).toEqual([220, 220, 330, 220, 220, 330]);
    // One context for the whole count.
    expect(created).toHaveBeenCalledTimes(1);
  });

  it('after a full count, explains the pauses and offers the way on', () => {
    fakeAudio();
    const onDone = vi.fn();
    render(<SalsaCount onDone={onDone} />);
    expect(screen.queryByRole('button', { name: 'Continue' })).toBe(null);
    tap(8);
    expect(
      screen.getByText('On 4 and 8, nobody steps: they’re pauses.'),
    ).toBeTruthy();
    expect(screen.getByText('And they’re part of the dance too.')).toBeTruthy();
    expect(screen.queryByText('Keep going…')).toBe(null);
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('starts a new count after 8, keeping the way on', () => {
    fakeAudio();
    const { container } = render(<SalsaCount onDone={() => undefined} />);
    tap(9);
    expect(drum().textContent).toBe('1');
    expect(lit(container)).toEqual(['1']);
    expect(screen.getByRole('button', { name: 'Continue' })).toBeTruthy();
  });

  it('still counts where sound cannot play', () => {
    vi.stubGlobal(
      'AudioContext',
      class {
        constructor() {
          throw new Error('no audio here');
        }
      },
    );
    const { container } = render(<SalsaCount onDone={() => undefined} />);
    tap(2);
    expect(lit(container)).toEqual(['1', '2']);
  });
});
