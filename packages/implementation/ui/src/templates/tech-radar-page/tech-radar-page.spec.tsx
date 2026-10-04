import { Quadrant, Ring, TechnologyArea } from '@myself-app/domain';
import { loadRadarPlacements } from '@myself-app/domain/use-cases';
import { layoutRadar } from '@myself-app/entifix-incubator-react-controls';
import { browserSources } from '@myself-app/implementation-adapters/browser';
import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { radarEntriesOf } from '../../organisms/radar-explorer/entries.js';
import { SourcesProvider } from '../../sources/sources.js';
import { renderPage } from '../../test/render.js';
import { SITE_CONTENT } from '../../test/shipped-content.js';
import { TechRadarPageView } from './tech-radar-page.js';

describe('the tech radar page', () => {
  it('draws the radar, its filter and what each ring means', async () => {
    const [placements, rings, quadrants, areas] = await Promise.all([
      loadRadarPlacements(SITE_CONTENT),
      SITE_CONTENT.loadAll(Ring, {
        sorting: [{ 0: { property: 'order', type: 'asc' } }],
      }),
      SITE_CONTENT.loadAll(Quadrant, {
        sorting: [{ 0: { property: 'order', type: 'asc' } }],
      }),
      SITE_CONTENT.loadAll(TechnologyArea),
    ]);
    await renderPage(
      Promise.resolve(
        <SourcesProvider sources={browserSources}>
          <TechRadarPageView
            locale="en"
            layout={layoutRadar(radarEntriesOf(placements))}
            rings={rings}
            quadrants={quadrants}
            areas={areas}
          />
        </SourcesProvider>,
      ),
      'en',
    );
    expect(
      screen.getByRole('heading', { level: 1, name: 'Tech radar' }),
    ).toBeTruthy();
    expect(screen.getByRole('img', { name: /radar/i })).toBeTruthy();
    const area = screen.getByRole('group', { name: 'Area' });
    // Sorted by name in the reader's language.
    const names = within(area)
      .getAllByRole('button')
      .map(button => button.textContent ?? '');
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'en')));
    // What each ring means is its chip's description.
    const adopt = within(screen.getByRole('group', { name: 'Ring' })).getByRole(
      'button',
      { name: rings[0]?.name?.en },
    );
    expect(
      document.getElementById(adopt.getAttribute('aria-describedby') as string)
        ?.textContent,
    ).toBe(rings[0]?.description?.en);
    // The legend folds before paint on a wide screen, its quadrants on a
    // narrow one.
    const scripts = [...document.querySelectorAll('script')]
      .map(script => script.innerHTML)
      .join('\n');
    expect(scripts).toContain('.radar-legend-panel');
    expect(scripts).toContain('.radar-legend-quadrant');
  });
});
