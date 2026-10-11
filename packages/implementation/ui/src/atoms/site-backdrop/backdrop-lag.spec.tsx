import { act, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { BackdropLag } from './backdrop-lag.js';

/** The backdrop the server rendered, its track, and the lag mounted beside it. */
function renderBackdrop(top: number, height = 3000) {
  const backdrop = document.createElement('div');
  backdrop.className = 'site-backdrop';
  const track = document.createElement('div');
  track.className = 'site-backdrop-track';
  backdrop.append(track);
  document.body.append(backdrop);
  const place = (at: number) => {
    backdrop.getBoundingClientRect = () => ({ top: at, height }) as DOMRect;
  };
  place(top);
  return { backdrop, track, place, ...render(<BackdropLag />) };
}

const progressOf = (track: HTMLElement) =>
  track.style.getPropertyValue('--backdrop-progress');

function scroll(event: 'scroll' | 'resize' = 'scroll') {
  act(() => {
    fireEvent(window, new Event(event));
    vi.runAllTimers();
  });
}

afterEach(() => {
  document.querySelector('.site-backdrop')?.remove();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('the backdrop’s lag without scroll timelines', () => {
  it('writes how far the backdrop has crossed the viewport, once a frame', () => {
    vi.useFakeTimers({
      toFake: ['requestAnimationFrame', 'cancelAnimationFrame'],
    });
    vi.stubGlobal('CSS', { supports: () => false });
    Object.defineProperty(window, 'innerHeight', {
      value: 1000,
      configurable: true,
    });
    const { track, place } = renderBackdrop(0);
    expect(progressOf(track)).toBe('0.25');
    place(-1000);
    act(() => {
      fireEvent.scroll(window);
      fireEvent.scroll(window);
    });
    // Not until the frame.
    expect(progressOf(track)).toBe('0.25');
    scroll();
    expect(progressOf(track)).toBe('0.5');
    // Clamped at both ends of the range.
    place(-5000);
    scroll('resize');
    expect(progressOf(track)).toBe('1');
    place(2000);
    scroll();
    expect(progressOf(track)).toBe('0');
  });

  it('stops listening once unmounted', () => {
    vi.useFakeTimers({
      toFake: ['requestAnimationFrame', 'cancelAnimationFrame'],
    });
    vi.stubGlobal('CSS', { supports: () => false });
    const { track, place, unmount } = renderBackdrop(0);
    const before = progressOf(track);
    place(-2000);
    act(() => {
      fireEvent.scroll(window);
    });
    unmount();
    scroll();
    expect(progressOf(track)).toBe(before);
  });

  it('leaves the track to CSS where scroll timelines exist', () => {
    vi.stubGlobal('CSS', { supports: () => true });
    const { track } = renderBackdrop(0);
    expect(progressOf(track)).toBe('');
  });

  it('does nothing on a page with no backdrop', () => {
    vi.stubGlobal('CSS', { supports: () => false });
    expect(() => render(<BackdropLag />)).not.toThrow();
  });
});
