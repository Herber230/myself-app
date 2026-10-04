import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { layoutRadar } from './layout';
import { RadarChart } from './radar-chart';
import { FIXTURE_RADAR_ENTRIES } from './radar-chart.fixture';
import { MOVEMENTS } from './types';

const LAYOUT = layoutRadar(FIXTURE_RADAR_ENTRIES);
const QUADRANTS = ['Techniques', 'Tools', 'Platforms', 'Languages'];
const RINGS = ['Adopt', 'Trial', 'Assess', 'Hold'];

const hrefOf = (id: string) => `/en/tech-radar/${id}/`;

function renderChart(props: Partial<Parameters<typeof RadarChart>[0]> = {}) {
  return render(
    <RadarChart
      layout={LAYOUT}
      locale="en"
      hrefOf={hrefOf}
      quadrants={QUADRANTS}
      rings={RINGS}
      label="Tech radar"
      {...props}
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

  it('names a blip by its id where its label lacks the locale shown', () => {
    const { container } = renderChart({ locale: 'fr' });
    const [blip] = LAYOUT.blips;
    expect(
      container.querySelector(`a[data-blip="${blip.id}"] title`)?.textContent,
    ).toBe(`${blip.number}. ${blip.id}`);
  });

  it('marks the blips a filter leaves out, and the one highlighted', () => {
    const [first, second] = LAYOUT.blips;
    const { container } = renderChart({
      dimmed: new Set([first.id]),
      highlighted: second.id,
    });
    const blip = (id: string) =>
      container.querySelector(`a[data-blip="${id}"]`) as HTMLElement;
    expect(blip(first.id).dataset.dimmed).toBe('true');
    expect(blip(first.id).dataset.highlighted).toBeUndefined();
    expect(blip(second.id).dataset.highlighted).toBe('true');
    expect(blip(second.id).dataset.dimmed).toBeUndefined();
  });

  it('reports the blip under the pointer, and when it leaves', () => {
    const onHighlight = vi.fn();
    const { container } = renderChart({ onHighlight });
    const [blip] = LAYOUT.blips;
    const link = container.querySelector(`a[data-blip="${blip.id}"]`)!;
    fireEvent.pointerEnter(link);
    fireEvent.pointerLeave(link);
    expect(onHighlight.mock.calls).toEqual([[blip.id], [undefined]]);
  });

  it('asks nobody about the pointer when no one listens', () => {
    const { container } = renderChart();
    const link = container.querySelector('a[data-blip]')!;
    expect(() => fireEvent.pointerEnter(link)).not.toThrow();
  });

  it('makes each quadrant’s name a button that reports it, pressed once chosen', () => {
    const onQuadrant = vi.fn();
    const { container } = renderChart({ onQuadrant, selectedQuadrants: [2] });
    const toggles = [
      ...container.querySelectorAll<HTMLButtonElement>(
        '[data-slot="radar-quadrant-toggle"]',
      ),
    ];
    expect(toggles.map(toggle => toggle.textContent)).toEqual(QUADRANTS);
    expect(toggles.map(toggle => toggle.getAttribute('aria-pressed'))).toEqual([
      'false',
      'false',
      'true',
      'false',
    ]);
    // Each at its own outer corner.
    expect(
      toggles.map(toggle => [
        toggle.style.right !== '' ? 'right' : 'left',
        toggle.style.bottom !== '' ? 'bottom' : 'top',
      ]),
    ).toEqual([
      ['right', 'bottom'],
      ['left', 'bottom'],
      ['left', 'top'],
      ['right', 'top'],
    ]);
    fireEvent.click(toggles[1] as HTMLButtonElement);
    expect(onQuadrant).toHaveBeenCalledWith(1);
  });

  it.each([
    [0, [1, 1], 'start', 1],
    [1, [-1, 1], 'end', 1],
    [2, [-1, -1], 'end', -1],
    [3, [1, -1], 'start', -1],
  ] as const)(
    'zooms quadrant %i from its outer corner, its rings named inside it',
    (zoom, [x, y], anchor, sign) => {
      const { container } = renderChart({
        onQuadrant: vi.fn(),
        zoom,
        zoomOutLabel: 'Show the whole radar',
      });
      const group = container.querySelector<SVGGElement>(
        '[data-slot="radar-zoom"]',
      ) as SVGGElement;
      // The view box starts at minus the reach: the picture's corner.
      const reach = -Number(
        container.querySelector('svg')?.getAttribute('viewBox')?.split(' ')[0],
      );
      expect(group.style.transform).toBe('scale(2)');
      expect(group.style.transformOrigin).toBe(`${x * reach}px ${y * reach}px`);
      const ring = screen.getByText(RINGS[0] as string);
      expect(ring.getAttribute('text-anchor')).toBe(anchor);
      expect(Math.sign(Number(ring.getAttribute('y')))).toBe(sign);
      const toggles = container.querySelectorAll(
        '[data-slot="radar-quadrant-toggle"]',
      );
      expect(toggles).toHaveLength(1);
      expect(toggles[0]?.textContent).toBe(QUADRANTS[zoom]);
      expect(toggles[0]?.getAttribute('title')).toBe('Show the whole radar');
    },
  );

  it('draws the whole radar, unscaled, while nothing is zoomed', () => {
    const { container } = renderChart({ onQuadrant: vi.fn() });
    const group = container.querySelector<SVGGElement>(
      '[data-slot="radar-zoom"]',
    ) as SVGGElement;
    expect(group.style.transform).toBe('');
    const ring = screen.getByText(RINGS[0] as string);
    expect(ring.getAttribute('text-anchor')).toBe('middle');
    expect(
      container
        .querySelector('[data-slot="radar-quadrant-toggle"]')
        ?.hasAttribute('title'),
    ).toBe(false);
  });
});
