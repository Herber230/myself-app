import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { LayerDiagram } from './layer-diagram';

const BOXES = [
  { id: 'app', label: 'app', band: 0, column: 1 },
  { id: 'ui', label: 'ui', band: 1, column: 0 },
  { id: 'domain', label: 'domain', band: 2, column: 1 },
];

const EDGES = [
  { from: 'app', to: 'ui' },
  { from: 'ui', to: 'domain' },
  { from: 'domain', to: 'ui', refused: 'Upward.' },
  { from: 'ui', to: 'missing' },
];

function draw(props: Partial<Parameters<typeof LayerDiagram>[0]> = {}) {
  return render(
    <LayerDiagram
      label="Packages by layer"
      bands={['App', 'Implementation', 'Domain']}
      boxes={BOXES}
      edges={EDGES}
      {...props}
    />,
  );
}

const edgesOf = (container: HTMLElement) => [
  ...container.querySelectorAll('[data-slot="layer-edge"]'),
];

describe('a layer diagram', () => {
  it('draws a band per layer, a box per package and an arrow per import it can place', () => {
    const { container } = draw({ className: 'extra' });
    expect(
      screen
        .getByRole('group', { name: 'Packages by layer' })
        .getAttribute('class'),
    ).toContain('extra');
    expect(container.querySelectorAll('[data-slot="layer-band"]')).toHaveLength(
      3,
    );
    expect(screen.getAllByRole('button')).toHaveLength(3);
    expect(edgesOf(container)).toHaveLength(3);
  });

  it('dashes a refused import, its reason as its title', () => {
    const { container } = draw();
    const refused = edgesOf(container).filter(edge =>
      edge.hasAttribute('data-refused'),
    );
    expect(refused).toHaveLength(1);
    expect(refused[0]?.querySelector('title')?.textContent).toBe('Upward.');
    expect(refused[0]?.getAttribute('marker-end')).toMatch(/-refused\)$/);
  });

  it('lets the active box’s arrows stand out, and fades the rest', () => {
    const { container } = draw({ active: 'app' });
    const [appToUi, uiToDomain, domainToUi] = edgesOf(container);
    expect(appToUi?.hasAttribute('data-out')).toBe(true);
    expect(appToUi?.hasAttribute('data-dim')).toBe(false);
    expect(uiToDomain?.hasAttribute('data-dim')).toBe(true);
    expect(domainToUi?.hasAttribute('data-dim')).toBe(true);
    expect(
      screen.getByRole('button', { name: 'app' }).hasAttribute('data-active'),
    ).toBe(true);
    // An arrow into the active box stays, without standing out.
    const { container: second } = draw({ active: 'domain' });
    expect(edgesOf(second)[1]?.hasAttribute('data-dim')).toBe(false);
    expect(edgesOf(second)[1]?.hasAttribute('data-out')).toBe(false);
  });

  it('tells the page which box the pointer or focus reached', () => {
    const onActive = vi.fn();
    draw({ onActive });
    const ui = screen.getByRole('button', { name: 'ui' });
    fireEvent.mouseEnter(ui);
    fireEvent.focus(ui);
    fireEvent.click(ui);
    expect(onActive.mock.calls).toEqual([['ui'], ['ui'], ['ui']]);
  });

  it('draws without a listener', () => {
    draw();
    const ui = screen.getByRole('button', { name: 'ui' });
    expect(() => {
      fireEvent.mouseEnter(ui);
      fireEvent.focus(ui);
      fireEvent.click(ui);
    }).not.toThrow();
  });
});
