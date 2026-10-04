import { loadRadarPlacements } from '@myself-app/domain/use-cases';
import {
  layoutRadar,
  type RadarLayout,
} from '@myself-app/entifix-incubator-react-controls';
import { browserSources } from '@myself-app/implementation-adapters/browser';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { SourcesProvider } from '../../sources/sources.js';
import { SITE_CONTENT } from '../../test/shipped-content.js';
import { radarEntriesOf } from './entries.js';
import { RadarExplorer } from './radar-explorer.js';

let layout: RadarLayout;

beforeAll(async () => {
  layout = layoutRadar(radarEntriesOf(await loadRadarPlacements(SITE_CONTENT)));
  // The file the export writes, served where the explorer asks for it.
  const file = JSON.stringify(await SITE_CONTENT.dataFile('technology.json'));
  vi.stubGlobal('fetch', async (url: string) =>
    url === '/data/technology.json'
      ? new Response(file)
      : new Response('', { status: 404 }),
  );
});

afterAll(() => {
  vi.unstubAllGlobals();
});

afterEach(() => {
  window.history.replaceState(null, '', '/en/tech-radar/');
});

const explorer = () => (
  <SourcesProvider sources={browserSources}>
    <RadarExplorer
      layout={layout}
      locale="en"
      quadrants={['Techniques', 'Tools', 'Platforms', 'Languages']}
      rings={['Adopt', 'Trial', 'Assess', 'Hold']}
      ringMeanings={['In production, chosen again.', 'Trying it on real work.']}
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
        placeholder: 'Kubernetes…',
        hideLegend: 'Hide the list',
        showLegend: 'Show the list',
        legendCount: '{{n}} technologies',
        view: 'Show as',
        viewList: 'List',
        viewChart: 'Chart',
        zoomOut: 'Show the whole radar',
        title: 'Filters',
        active: '{{n}} active',
        remove: 'Remove {{name}}',
        showing: 'Showing {{shown}} of {{total}}',
      }}
    >
      <p>The ring key</p>
    </RadarExplorer>
  </SourcesProvider>
);

const dimmedBlips = () =>
  [...document.querySelectorAll('a[data-blip][data-dimmed]')].map(blip =>
    blip.getAttribute('data-blip'),
  );

describe('the radar explorer', () => {
  it('is the whole radar in the static HTML, with no controls', () => {
    const html = renderToString(explorer());
    expect(html).not.toContain('Filter the radar');
    expect(html).not.toMatch(/data-dimmed=/);
    expect(html).toContain('The ring key');
  });

  it('reads its filter from the URL, and dims what it leaves out', async () => {
    window.history.replaceState(null, '', '/en/tech-radar/?area=monorepo');
    render(explorer());
    const total = layout.blips.length;
    await waitFor(() => expect(dimmedBlips()).toHaveLength(total - 3));
    expect(screen.getByText(`Showing 3 of ${total}`)).toBeTruthy();
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

  it('keeps the last answer on screen while the next one is asked', async () => {
    window.history.replaceState(null, '', '/en/tech-radar/?area=monorepo');
    render(explorer());
    const total = layout.blips.length;
    await waitFor(() => expect(dimmedBlips()).toHaveLength(total - 3));
    fireEvent.click(screen.getByRole('button', { name: 'CSS' }));
    // Answered on a later tick: until then, the monorepo answer stays.
    expect(dimmedBlips()).toHaveLength(total - 3);
    await waitFor(() => expect(dimmedBlips().length).not.toBe(total - 3));
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

  it('follows the URL back and forward', async () => {
    render(explorer());
    act(() => {
      window.history.pushState(null, '', '/en/tech-radar/?q=typescript');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    await waitFor(() =>
      expect(dimmedBlips()).toHaveLength(layout.blips.length - 1),
    );
    expect(dimmedBlips()).not.toContain('typescript');
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

  it('says what the chosen rings mean, and counts and removes what is in force', async () => {
    window.history.replaceState(
      null,
      '',
      '/en/tech-radar/?ring=adopt&ring=hold&q=nx',
    );
    render(explorer());
    await screen.findByText('3 active');
    // Only a ring with a meaning is told.
    const note = document.querySelector('[data-slot="filter-note"]');
    expect(note?.textContent).toBe('AdoptIn production, chosen again.');
    fireEvent.click(
      screen.getByRole('button', { name: 'Remove Search: “nx”' }),
    );
    expect(window.location.search).toBe('?ring=adopt&ring=hold');
    fireEvent.click(screen.getByRole('button', { name: 'Remove Ring: Hold' }));
    expect(window.location.search).toBe('?ring=adopt');
  });

  it('filters by a quadrant pressed on the picture, and zooms into it alone', () => {
    const { container } = render(explorer());
    const toggles = () =>
      [
        ...container.querySelectorAll<HTMLButtonElement>(
          '[data-slot="radar-quadrant-toggle"]',
        ),
      ].map(toggle => toggle.textContent);
    expect(toggles()).toEqual([
      'Techniques',
      'Tools',
      'Platforms',
      'Languages',
    ]);
    fireEvent.click(
      container.querySelectorAll(
        '[data-slot="radar-quadrant-toggle"]',
      )[2] as Element,
    );
    expect(window.location.search).toBe('?quadrant=platforms');
    expect(toggles()).toEqual(['Platforms']);
    expect(
      container
        .querySelector('[data-slot="radar-quadrant-toggle"]')
        ?.getAttribute('title'),
    ).toBe('Show the whole radar');
  });

  it('switches between the list and the picture on a narrow screen', () => {
    const { container } = render(explorer());
    const split = container.querySelector('.radar-split') as HTMLElement;
    expect(split.dataset['view']).toBe('list');
    fireEvent.click(screen.getByRole('radio', { name: 'Chart' }));
    expect(split.dataset['view']).toBe('chart');
  });
});
