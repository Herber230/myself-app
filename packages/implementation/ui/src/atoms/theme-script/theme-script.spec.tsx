import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { THEME_COOKIE } from '../../theme/theme.js';
import { ThemeScript } from './theme-script.js';

/** Runs the inline script as the browser would, before first paint. */
function runThemeScript() {
  const host = document.createElement('div');
  host.innerHTML = renderToStaticMarkup(<ThemeScript />);
  new Function(host.querySelector('script')?.textContent ?? '')();
}

const painted = () => document.documentElement.dataset['theme'];

const storeTheme = (value: string) => {
  document.cookie = `${THEME_COOKIE}=${value}; path=/`;
};

afterEach(() => {
  document.cookie = `${THEME_COOKIE}=; path=/; max-age=0`;
});

describe('the theme script', () => {
  it('paints a stored theme', () => {
    storeTheme('dark');
    runThemeScript();
    expect(painted()).toBe('dark');
  });

  it('paints the default when nothing is stored, and stores nothing', () => {
    runThemeScript();
    expect(painted()).toBe('blue');
    expect(document.cookie).not.toContain(THEME_COOKIE);
  });

  it('replaces a stored value that is no theme', () => {
    storeTheme('purple');
    runThemeScript();
    expect(painted()).toBe('blue');
  });

  it('leaves the page unthemed when cookies cannot be read', () => {
    const cookie = vi
      .spyOn(document, 'cookie', 'get')
      .mockImplementation(() => {
        throw new Error('blocked');
      });
    runThemeScript();
    expect(painted()).toBeUndefined();
    cookie.mockRestore();
  });
});
