import { act, fireEvent, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { loadRadarEntries } from '../../content/radar';
import { SITE_REPOSITORIES } from '../../content/repositories';
import { layoutRadar } from './layout';
import { RadarExplorer } from './radar-explorer';
import type { RadarLayout } from './types';

let layout: RadarLayout;

beforeAll(async () => {
  layout = layoutRadar(await loadRadarEntries(SITE_REPOSITORIES));
});

afterEach(() => {
  window.history.replaceState(null, '', '/en/tech-radar/');
});

const explorer = () => (
  <RadarExplorer
    layout={layout}
    locale="en"
    quadrants={['Techniques', 'Tools', 'Platforms', 'Languages']}
    rings={['Adopt', 'Trial', 'Assess', 'Hold']}
    areas={[
      { id: 'css', name: 'CSS' },
      { id: 'monorepo', name: 'Monorepo' },
    ]}
    vocabulary={{
      quadrants: [
        'techniques',
        'tools',
        'platforms',
        'languages-and-frameworks',
      ],
      rings: ['adopt', 'trial', 'assess', 'hold'],
      areas: ['css', 'monorepo'],
    }}
    copy={{
      chartLabel: 'Tech radar',
      legend: 'Every blip',
      filters: 'Filter the radar',
      quadrant: 'Quadrant',
      ring: 'Ring',
      area: 'Area',
      search: 'Search',
      clear: 'Show everything',
      showing: 'Showing {{shown}} of {{total}}',
    }}
  >
    <p>The ring key</p>
  </RadarExplorer>
);

const dimmedBlips = () =>
  [...document.querySelectorAll('a[data-blip][data-dimmed]')].map(blip =>
    blip.getAttribute('data-blip'),
  );

describe('the radar explorer', () => {
  it('is the whole radar in the static HTML, with no controls', () => {
    const html = renderToString(explorer());
    expect(html).not.toContain('Filter the radar');
    expect(html).not.toContain('data-dimmed');
    expect(html).toContain('The ring key');
  });

  it('reads its filter from the URL, and dims what it leaves out', () => {
    window.history.replaceState(null, '', '/en/tech-radar/?area=monorepo');
    render(explorer());
    const total = layout.blips.length;
    expect(dimmedBlips()).toHaveLength(total - 2);
    expect(screen.getByText(`Showing 2 of ${total}`)).toBeTruthy();
    expect(
      screen
        .getByRole('button', { name: 'Monorepo' })
        .getAttribute('aria-pressed'),
    ).toBe('true');
    expect(
      document.querySelector('#tech-nx')?.hasAttribute('data-dimmed'),
    ).toBe(false);
    expect(
      document.querySelector('#tech-typescript')?.hasAttribute('data-dimmed'),
    ).toBe(true);
  });

  it('writes each toggle to the URL, and clears them all', () => {
    render(explorer());
    const within = (name: string) =>
      screen.getByRole('group', { name }).querySelectorAll('button');

    fireEvent.click(within('Quadrant')[1]);
    fireEvent.click(within('Ring')[0]);
    fireEvent.click(screen.getByRole('button', { name: 'CSS' }));
    expect(window.location.search).toBe('?quadrant=tools&ring=adopt&area=css');

    fireEvent.click(within('Ring')[0]);
    expect(window.location.search).toBe('?quadrant=tools&area=css');

    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: 'next' },
    });
    expect(window.location.search).toContain('q=next');

    fireEvent.click(screen.getByRole('button', { name: 'Show everything' }));
    expect(window.location.search).toBe('');
    expect(dimmedBlips()).toEqual([]);
    expect(
      screen.queryByRole('button', { name: 'Show everything' }),
    ).toBeNull();
  });

  it('follows the URL back and forward', () => {
    render(explorer());
    act(() => {
      window.history.pushState(null, '', '/en/tech-radar/?q=typescript');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(dimmedBlips()).not.toContain('typescript');
    expect(dimmedBlips()).toHaveLength(layout.blips.length - 1);
  });

  it('marks a blip while its legend entry is hovered or focused, and back', () => {
    const { unmount } = render(explorer());
    const entry = document.querySelector('#tech-nx') as HTMLElement;
    const blip = document.querySelector('a[data-blip="nx"]') as Element;

    fireEvent.pointerEnter(entry);
    expect(blip.hasAttribute('data-highlighted')).toBe(true);
    fireEvent.pointerLeave(entry);
    expect(blip.hasAttribute('data-highlighted')).toBe(false);

    fireEvent.focus(entry);
    expect(blip.hasAttribute('data-highlighted')).toBe(true);
    fireEvent.blur(entry);
    expect(blip.hasAttribute('data-highlighted')).toBe(false);

    fireEvent.pointerEnter(blip);
    expect(entry.hasAttribute('data-highlighted')).toBe(true);
    fireEvent.pointerLeave(blip);
    expect(entry.hasAttribute('data-highlighted')).toBe(false);
    unmount();
  });
});
