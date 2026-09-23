import { ThemeProvider } from '@entifix/react-controls/primitives';
import { render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { stubIntersectionObserver } from '../test/intersection-observer';
import { SiteNav } from './site-nav';

beforeEach(() => {
  stubIntersectionObserver();
});

afterEach(() => vi.unstubAllGlobals());

function renderNav(props: Parameters<typeof SiteNav>[0]) {
  return render(
    <ThemeProvider themes={[{ id: 'blue', label: 'Blue' }]} defaultTheme="blue">
      <SiteNav {...props} />
    </ThemeProvider>,
  );
}

describe('the site nav', () => {
  it('lists the sections, the CV and the radar, inline and in the menu', () => {
    renderNav({ locale: 'en', path: '/cv' });
    const lists = screen.getAllByRole('navigation', {
      name: 'Sections',
      hidden: true,
    });
    expect(lists).toHaveLength(2);
    for (const list of lists) {
      const links = within(list).getAllByRole('link', { hidden: true });
      expect(links.map(link => link.getAttribute('href'))).toEqual([
        '/en/#about',
        '/en/#projects',
        '/en/#entifix',
        '/en/#contact',
        '/en/cv/',
        '/en/tech-radar/',
      ]);
    }
    expect(
      screen.getByRole('link', { name: 'Herber Colop' }).getAttribute('href'),
    ).toBe('/en/');
  });

  it('offers the other language for the same page, and marks its own', () => {
    renderNav({ locale: 'es', path: '/tech-radar' });
    const menu = screen.getByLabelText('Idioma').parentElement as HTMLElement;
    const other = within(menu).getByRole('link', {
      name: 'English',
      hidden: true,
    });
    expect(other.getAttribute('href')).toBe('/en/tech-radar/');
    expect(other.hasAttribute('data-keep-section')).toBe(true);
    const own = within(menu).getByText('Español');
    expect(own.getAttribute('aria-current')).toBe('true');
  });

  it('reveals on scroll, with its section leaves, only when asked', () => {
    const { container, unmount } = renderNav({ locale: 'en', path: '/' });
    expect(container.querySelector('header')?.className).toBe('site-nav');
    unmount();

    const revealed = renderNav({ locale: 'en', path: '/', reveal: true });
    expect(revealed.container.querySelector('header')?.className).toBe(
      'site-nav site-nav-reveal',
    );
  });
});
