import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FIXTURE_RADAR_ENTRIES } from './fixture-entries';
import { layoutRadar } from './layout';
import { RadarLegend } from './radar-legend';

const QUADRANTS = ['Techniques', 'Tools', 'Platforms', 'Languages'];
const RINGS = ['Adopt', 'Trial', 'Assess', 'Hold'];

describe('the radar legend', () => {
  it('lists every blip by quadrant and ring, in number order', () => {
    const layout = layoutRadar(FIXTURE_RADAR_ENTRIES);
    render(
      <RadarLegend
        layout={layout}
        locale="es"
        quadrants={QUADRANTS}
        rings={RINGS}
      />,
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(layout.blips.length);
    const first = layout.blips.find(blip => blip.number === 1);
    expect(screen.getByText(first?.label.es ?? '')).toBeTruthy();

    const section = screen.getByRole('region', { name: 'Techniques' });
    const numbers = within(section)
      .getAllByRole('listitem')
      .map(item => Number(item.firstElementChild?.textContent));
    expect(numbers).toEqual([...numbers].sort((a, b) => a - b));
  });

  it('anchors each entry by its technology', () => {
    const layout = layoutRadar(FIXTURE_RADAR_ENTRIES);
    render(
      <RadarLegend
        layout={layout}
        locale="en"
        quadrants={QUADRANTS}
        rings={RINGS}
      />,
    );
    const [blip] = layout.blips;
    expect(document.getElementById(`tech-${blip?.id}`)?.textContent).toContain(
      blip?.label.en,
    );
  });

  it("links each entry to its technology's page", () => {
    const layout = layoutRadar(FIXTURE_RADAR_ENTRIES);
    render(
      <RadarLegend
        layout={layout}
        locale="es"
        quadrants={QUADRANTS}
        rings={RINGS}
      />,
    );
    const [blip] = layout.blips;
    expect(
      screen.getByRole('link', { name: blip?.label.es }).getAttribute('href'),
    ).toBe(`/es/tech-radar/${blip?.id}/`);
  });

  it('leaves out a ring with nothing in it', () => {
    const layout = layoutRadar(
      FIXTURE_RADAR_ENTRIES.filter(entry => entry.ring === 0),
    );
    render(
      <RadarLegend
        layout={layout}
        locale="en"
        quadrants={QUADRANTS}
        rings={RINGS}
      />,
    );
    expect(screen.getAllByText('Adopt').length).toBeGreaterThan(0);
    expect(screen.queryByText('Hold')).toBeNull();
  });
});
