import { act, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { NavReveal } from './nav-reveal.js';

function scrollTo(y: number) {
  Object.defineProperty(window, 'scrollY', { value: y, configurable: true });
  act(() => {
    fireEvent.scroll(window);
  });
}

/** The bar the server rendered, and the reveal mounted beside it. */
function renderBar() {
  const bar = document.createElement('header');
  bar.className = 'site-nav-reveal';
  document.body.append(bar);
  return { bar, ...render(<NavReveal />) };
}

afterEach(() => {
  document.querySelector('.site-nav-reveal')?.remove();
  vi.unstubAllGlobals();
  Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
});

describe('the landing bar’s reveal without scroll timelines', () => {
  it('marks the bar once the page has scrolled a third of the viewport, and unmarks it above', () => {
    vi.stubGlobal('CSS', { supports: () => false });
    Object.defineProperty(window, 'innerHeight', {
      value: 1000,
      configurable: true,
    });
    const { bar } = renderBar();
    expect(bar.hasAttribute('data-revealed')).toBe(false);
    scrollTo(400);
    expect(bar.hasAttribute('data-revealed')).toBe(true);
    scrollTo(100);
    expect(bar.hasAttribute('data-revealed')).toBe(false);
    // A resize moves the line it is measured against.
    scrollTo(300);
    Object.defineProperty(window, 'innerHeight', {
      value: 800,
      configurable: true,
    });
    act(() => {
      fireEvent(window, new Event('resize'));
    });
    expect(bar.hasAttribute('data-revealed')).toBe(true);
  });

  it('stops listening once unmounted', () => {
    vi.stubGlobal('CSS', { supports: () => false });
    const { bar, unmount } = renderBar();
    unmount();
    scrollTo(5000);
    expect(bar.hasAttribute('data-revealed')).toBe(false);
  });

  it('leaves the bar to CSS where scroll timelines exist', () => {
    vi.stubGlobal('CSS', { supports: () => true });
    const { bar } = renderBar();
    scrollTo(5000);
    expect(bar.hasAttribute('data-revealed')).toBe(false);
  });

  it('does nothing on a page with no landing bar', () => {
    vi.stubGlobal('CSS', { supports: () => false });
    expect(() => render(<NavReveal />)).not.toThrow();
  });
});
