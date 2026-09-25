import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FIXTURE_RADAR_ENTRIES } from './fixture-entries';
import { layoutRadar } from './layout';
import { RadarChart } from './radar-chart';
import { MOVEMENTS } from './types';

const LAYOUT = layoutRadar(FIXTURE_RADAR_ENTRIES);
const QUADRANTS = ['Techniques', 'Tools', 'Platforms', 'Languages'];
const RINGS = ['Adopt', 'Trial', 'Assess', 'Hold'];

function renderChart() {
  return render(
    <RadarChart
      layout={LAYOUT}
      locale="en"
      quadrants={QUADRANTS}
      rings={RINGS}
      label="Tech radar"
    />,
  );
}

describe('the radar chart', () => {
  it('is one named picture', () => {
    renderChart();
    expect(screen.getByRole('img', { name: 'Tech radar' })).toBeTruthy();
  });

  it('draws every ring, with its name', () => {
    const { container } = renderChart();
    expect(container.querySelectorAll('circle')).toHaveLength(
      LAYOUT.ringRadii.length,
    );
    for (const ring of RINGS) expect(screen.getByText(ring)).toBeTruthy();
  });

  it('names each quadrant at its outer corner', () => {
    renderChart();
    const anchors = QUADRANTS.map(name =>
      screen.getByText(name).getAttribute('text-anchor'),
    );
    expect(anchors).toEqual(['end', 'start', 'start', 'end']);
  });

  it('draws one numbered blip per entry, shaped by its movement', () => {
    const { container } = renderChart();
    const blips = container.querySelectorAll('g[transform]');
    expect(blips).toHaveLength(LAYOUT.blips.length);
    const shapes = new Set(
      [...blips].map(blip => blip.querySelector('path')?.getAttribute('d')),
    );
    // Every movement the fixture draws gets its own shape.
    expect(shapes.size).toBe(MOVEMENTS.length);
    for (const blip of LAYOUT.blips) {
      expect(screen.getByText(String(blip.number))).toBeTruthy();
    }
  });

  it("links each blip to its technology's page, for the pointer only", () => {
    const { container } = renderChart();
    const [blip] = LAYOUT.blips;
    const link = container.querySelector(`a[data-blip="${blip.id}"]`);
    expect(link?.getAttribute('href')).toBe(`/en/tech-radar/${blip.id}/`);
    expect(link?.getAttribute('tabindex')).toBe('-1');
    expect(link?.getAttribute('aria-hidden')).toBe('true');
    expect(link?.querySelector('title')?.textContent).toBe(
      `${blip.number}. ${blip.label.en}`,
    );
  });
});
