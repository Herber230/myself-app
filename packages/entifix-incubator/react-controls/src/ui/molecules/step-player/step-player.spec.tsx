import { act, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { StepPlayer } from './step-player';

const COPY = {
  step: 'Step {{n}} of {{count}}',
  previous: 'Previous',
  next: 'Next',
  play: 'Play',
  pause: 'Pause',
  restart: 'Restart',
};

function Player({ start = 0, count = 3 }: { start?: number; count?: number }) {
  const [index, setIndex] = useState(start);
  return (
    <StepPlayer
      count={count}
      index={index}
      onIndex={setIndex}
      failing={[2]}
      interval={1000}
      copy={COPY}
      className="extra"
    />
  );
}

const count = () => screen.getByText(/^Step /).textContent;
const marks = (container: HTMLElement) =>
  [...container.querySelectorAll('[data-slot="step-player-track"] li')].map(
    mark =>
      `${mark.hasAttribute('data-done') ? 'done' : '-'}${mark.hasAttribute('data-failing') ? '!' : ''}`,
  );

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('a step player', () => {
  it('counts the step shown, and marks the track up to it', () => {
    const { container } = render(<Player start={1} />);
    expect(
      container.querySelector('[data-slot="step-player"]')?.className,
    ).toContain('extra');
    expect(count()).toBe('Step 2 of 3');
    expect(marks(container)).toEqual(['done', 'done', '-!']);
  });

  it('steps back and forth, its ends disabled', () => {
    render(<Player />);
    expect(screen.getByRole('button', { name: 'Previous' })).toHaveProperty(
      'disabled',
      true,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(count()).toBe('Step 3 of 3');
    expect(screen.getByRole('button', { name: 'Next' })).toHaveProperty(
      'disabled',
      true,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Previous' }));
    expect(count()).toBe('Step 2 of 3');
  });

  it('plays a step at a time, stops at the last, and restarts from the first', () => {
    render(<Player />);
    fireEvent.click(screen.getByRole('button', { name: 'Play' }));
    expect(
      screen
        .getByRole('button', { name: 'Pause' })
        .getAttribute('aria-pressed'),
    ).toBe('true');
    act(() => vi.advanceTimersByTime(1000));
    expect(count()).toBe('Step 2 of 3');
    act(() => vi.advanceTimersByTime(1000));
    expect(count()).toBe('Step 3 of 3');
    act(() => vi.advanceTimersByTime(1000));
    fireEvent.click(screen.getByRole('button', { name: 'Restart' }));
    expect(count()).toBe('Step 1 of 3');
    expect(screen.getByRole('button', { name: 'Pause' })).toBeTruthy();
  });

  it('pauses, and stops playing when stepped by hand', () => {
    render(<Player />);
    fireEvent.click(screen.getByRole('button', { name: 'Play' }));
    fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
    act(() => vi.advanceTimersByTime(3000));
    expect(count()).toBe('Step 1 of 3');
    fireEvent.click(screen.getByRole('button', { name: 'Play' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    act(() => vi.advanceTimersByTime(3000));
    expect(count()).toBe('Step 2 of 3');
    expect(screen.getByRole('button', { name: 'Play' })).toBeTruthy();
  });

  it('plays every 2.6 seconds and marks nothing failing by default', () => {
    const onIndex = vi.fn();
    const { container } = render(
      <StepPlayer count={2} index={0} onIndex={onIndex} copy={COPY} />,
    );
    expect(marks(container)).toEqual(['done', '-']);
    fireEvent.click(screen.getByRole('button', { name: 'Play' }));
    act(() => vi.advanceTimersByTime(2599));
    expect(onIndex).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(onIndex).toHaveBeenCalledWith(1);
  });
});
