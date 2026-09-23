import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { THEME_STORAGE_KEY } from '../theme';
import { ThemeScript } from './theme-script';

/** Runs the inline script as the browser would, before first paint. */
function runThemeScript() {
  const host = document.createElement('div');
  host.innerHTML = renderToStaticMarkup(<ThemeScript />);
  new Function(host.querySelector('script')?.textContent ?? '')();
}

const painted = () => document.documentElement.dataset['theme'];

describe('the theme script', () => {
  it('paints a stored theme', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    runThemeScript();
    expect(painted()).toBe('dark');
  });

  it('paints and stores the default when nothing is stored', () => {
    runThemeScript();
    expect(painted()).toBe('blue');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('blue');
  });

  it('replaces a stored value that is no theme', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'purple');
    runThemeScript();
    expect(painted()).toBe('blue');
  });

  it('leaves the page unthemed when storage cannot be read', () => {
    const getItem = vi
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation(() => {
        throw new Error('blocked');
      });
    runThemeScript();
    expect(painted()).toBeUndefined();
    getItem.mockRestore();
  });
});
