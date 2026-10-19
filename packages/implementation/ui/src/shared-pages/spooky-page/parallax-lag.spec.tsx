import { act, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ParallaxLag } from './parallax-lag.js';

/** The backdrop the server rendered, on a page of the given height. */
function renderBackdrop(pageHeight: number) {
  const backdrop = document.createElement('div');
  backdrop.className = 'spooky-parallax';
  document.body.append(backdrop);
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    value: pageHeight,
    configurable: true,
  });
  Object.defineProperty(window, 'innerHeight', {
    value: 1000,
    configurable: true,
  });
  return { backdrop, ...render(<ParallaxLag />) };
}

const progressOf = (backdrop: HTMLElement) =>
  backdrop.style.getPropertyValue('--spooky-progress');

function scrollTo(y: number, event: 'scroll' | 'resize' = 'scroll') {
  Object.defineProperty(window, 'scrollY', { value: y, configurable: true });
  act(() => {
    fireEvent(window, new Event(event));
    vi.runAllTimers();
  });
}

afterEach(() => {
  document.querySelector('.spooky-parallax')?.remove();
  vi.unstubAllGlobals();
  vi.useRealTimers();
  Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
});

describe('the parallax lag without scroll timelines', () => {
  it('writes how far the page has scrolled, once a frame', () => {
    vi.useFakeTimers({
      toFake: ['requestAnimationFrame', 'cancelAnimationFrame'],
    });
    vi.stubGlobal('CSS', { supports: () => false });
    const { backdrop } = renderBackdrop(5000);
    expect(progressOf(backdrop)).toBe('0');
    Object.defineProperty(window, 'scrollY', {
      value: 2000,
      configurable: true,
    });
    act(() => {
      fireEvent.scroll(window);
      fireEvent.scroll(window);
    });
    // Not until the frame.
    expect(progressOf(backdrop)).toBe('0');
    scrollTo(2000);
    expect(progressOf(backdrop)).toBe('0.5');
    // Clamped at the end, as an overscroll can pass it.
    scrollTo(4400, 'resize');
    expect(progressOf(backdrop)).toBe('1');
  });

  it('holds still on a page that does not scroll', () => {
    vi.stubGlobal('CSS', { supports: () => false });
    const { backdrop } = renderBackdrop(800);
    expect(progressOf(backdrop)).toBe('0');
  });

  it('stops listening once unmounted', () => {
    vi.useFakeTimers({
      toFake: ['requestAnimationFrame', 'cancelAnimationFrame'],
    });
    vi.stubGlobal('CSS', { supports: () => false });
    const { backdrop, unmount } = renderBackdrop(5000);
    Object.defineProperty(window, 'scrollY', {
      value: 2000,
      configurable: true,
    });
    act(() => {
      fireEvent.scroll(window);
    });
    unmount();
    scrollTo(2000);
    expect(progressOf(backdrop)).toBe('0');
  });

  it('leaves the layers to CSS where scroll timelines exist', () => {
    vi.stubGlobal('CSS', { supports: () => true });
    const { backdrop } = renderBackdrop(5000);
    expect(progressOf(backdrop)).toBe('');
  });

  it('does nothing on a page with no backdrop', () => {
    vi.stubGlobal('CSS', { supports: () => false });
    expect(() => render(<ParallaxLag />)).not.toThrow();
  });
});
