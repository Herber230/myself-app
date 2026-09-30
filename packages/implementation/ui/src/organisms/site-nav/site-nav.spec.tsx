import { ThemeProvider } from '@entifix/react-controls/primitives';
import { render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { stubIntersectionObserver } from '../../test/intersection-observer.js';
import { SiteNav } from './site-nav.js';

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
  it('lists the sections, the projects, the CV, the radar and the blog, inline and in the menu', () => {
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
        '/en/projects/entifix/',
        '/en/projects/myself-app/',
        '/en/#contact',
        '/en/cv/',
        '/en/tech-radar/',
        '/en/blog/',
      ]);
    }
    expect(
      screen.getByRole('link', { name: 'Herber Colop' }).getAttribute('href'),
    ).toBe('/en/');
  });

  it('opens the projects from a menu inline, and a nested list in the panel', () => {
    renderNav({ locale: 'es', path: '/projects/myself-app/adr/0016' });
    const [inline, panel] = screen.getAllByRole('navigation', {
      name: 'Secciones',
      hidden: true,
    }) as [HTMLElement, HTMLElement];
    const menu = within(inline).getByLabelText('Proyectos');
    expect(menu.closest('details')?.className).toContain('site-nav-projects');
    expect(
      within(inline)
        .getByRole('link', { name: 'Todos los proyectos', hidden: true })
        .getAttribute('href'),
    ).toBe('/es/#projects');
    expect(
      within(panel).queryByRole('link', {
        name: 'Todos los proyectos',
        hidden: true,
      }),
    ).toBeNull();
    for (const list of [inline, panel]) {
      const current = within(list).getByRole('link', {
        name: 'myself-app',
        hidden: true,
      });
      expect(current.getAttribute('aria-current')).toBe('page');
      expect(
        within(list)
          .getByRole('link', { name: 'entifix', hidden: true })
          .hasAttribute('aria-current'),
      ).toBe(false);
    }
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
