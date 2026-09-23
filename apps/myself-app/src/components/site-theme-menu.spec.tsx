import { ThemeProvider } from '@entifix/react-controls/primitives';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { SiteThemeMenu } from './site-theme-menu';

const THEMES = [
  { id: 'blue', label: 'Blue' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
];

function withTheme(
  children: ReactNode,
  defaultTheme = 'blue',
  themes = THEMES,
) {
  return (
    <ThemeProvider themes={themes} defaultTheme={defaultTheme}>
      {children}
    </ThemeProvider>
  );
}

const pressed = (name: string) =>
  screen
    .getByRole('button', { name, hidden: true })
    .getAttribute('aria-pressed');

describe('the theme menu', () => {
  it('holds its place in the static HTML, where no theme is known', () => {
    const html = renderToString(withTheme(<SiteThemeMenu label="Theme" />));
    expect(html).toContain('nav-menu-placeholder');
    expect(html).not.toContain('<details');
  });

  it('lists the themes once hydrated, the painted one pressed', () => {
    render(withTheme(<SiteThemeMenu label="Theme" />, 'dark'));
    expect(screen.getByLabelText('Theme')).toBeTruthy();
    expect(pressed('Dark')).toBe('true');
    expect(pressed('Blue')).toBe('false');
    expect(document.querySelector('.nav-icon path')?.getAttribute('d')).toMatch(
      /^M20 14\.5/,
    );
  });

  it('sets the theme picked, and closes', () => {
    const { container, unmount } = render(
      withTheme(<SiteThemeMenu label="Theme" />),
    );
    const menu = container.querySelector('details') as HTMLDetailsElement;
    menu.open = true;
    fireEvent.click(screen.getByRole('button', { name: 'Light' }));
    expect(document.documentElement.dataset['theme']).toBe('light');
    expect(pressed('Light')).toBe('true');
    expect(menu.open).toBe(false);
    unmount();
  });

  it("falls back to the site's icon for a theme it does not draw", () => {
    render(
      withTheme(<SiteThemeMenu label="Theme" />, 'sepia', [
        { id: 'sepia', label: 'Sepia' },
      ]),
    );
    expect(document.querySelector('.nav-icon path')?.getAttribute('d')).toMatch(
      /^M12 3\.5c3/,
    );
  });
});
