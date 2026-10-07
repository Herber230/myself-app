import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { HexagonDiagram } from './hexagon-diagram';

const RINGS = [
  { id: 'domain', label: 'Domain' },
  { id: 'ports', label: 'Ports' },
  { id: 'adapters', label: 'Adapters' },
];

const NODES = [
  { id: 'entity', label: 'Entity', ring: 'domain', angle: -90 },
  {
    id: 'repo',
    label: 'Repository',
    ring: 'ports',
    angle: 180,
    state: 'lit' as const,
  },
  {
    id: 'sql',
    label: 'SQL',
    ring: 'adapters',
    angle: 180,
    state: 'fails' as const,
  },
  {
    id: 'rest',
    label: 'REST',
    ring: 'adapters',
    angle: 0,
    state: 'dim' as const,
  },
];

function draw(props: Partial<Parameters<typeof HexagonDiagram>[0]> = {}) {
  return render(
    <HexagonDiagram
      label="Ports and adapters"
      rings={RINGS}
      nodes={NODES}
      edges={[
        { from: 'repo', to: 'entity', travelled: true },
        { from: 'sql', to: 'repo' },
        { from: 'rest', to: 'repo', dim: true },
        // A line to a part not drawn is left out.
        { from: 'rest', to: 'nowhere' },
      ]}
      {...props}
    />,
  );
}

describe('a hexagon diagram', () => {
  it('names itself, draws its rings outermost first, and a part per node', () => {
    const { container } = draw({ className: 'extra' });
    const svg = screen.getByRole('group', { name: 'Ports and adapters' });
    expect(svg.getAttribute('class')).toContain('extra');
    expect(
      [...container.querySelectorAll('[data-slot="hexagon-ring"]')].map(ring =>
        ring.getAttribute('data-ring'),
      ),
    ).toEqual(['adapters', 'ports', 'domain']);
    expect(
      screen
        .getAllByRole('button')
        .map(part => part.getAttribute('aria-label')),
    ).toEqual(['Entity', 'Repository', 'SQL', 'REST']);
  });

  it('marks each part and line by what the page says of it', () => {
    const { container } = draw({ selected: 'entity' });
    const state = (label: string) =>
      screen.getByRole('button', { name: label }).getAttribute('data-state');
    expect(state('Repository')).toBe('lit');
    expect(state('SQL')).toBe('fails');
    expect(state('REST')).toBe('dim');
    expect(
      screen
        .getByRole('button', { name: 'Entity' })
        .getAttribute('aria-pressed'),
    ).toBe('true');
    const edges = container.querySelectorAll('[data-slot="hexagon-edge"]');
    expect(edges).toHaveLength(3);
    expect(edges[0]?.hasAttribute('data-travelled')).toBe(true);
    expect(edges[1]?.hasAttribute('data-travelled')).toBe(false);
    expect(edges[2]?.hasAttribute('data-dim')).toBe(true);
  });

  it('chooses a part by click, Enter or Space, and ignores other keys', () => {
    const onSelect = vi.fn();
    draw({ onSelect });
    const sql = screen.getByRole('button', { name: 'SQL' });
    fireEvent.click(sql);
    fireEvent.keyDown(sql, { key: 'Enter' });
    fireEvent.keyDown(sql, { key: ' ' });
    fireEvent.keyDown(sql, { key: 'Tab' });
    expect(onSelect.mock.calls).toEqual([['sql'], ['sql'], ['sql']]);
  });

  it('draws without a listener, and a part of an unknown ring at the centre', () => {
    draw({
      nodes: [{ id: 'lost', label: 'Lost', ring: 'elsewhere', angle: 0 }],
      rings: [...RINGS, { id: 'fourth', label: 'Fourth' }],
      edges: [],
    });
    const lost = screen.getByRole('button', { name: 'Lost' });
    expect(() => fireEvent.click(lost)).not.toThrow();
    expect(() => fireEvent.keyDown(lost, { key: 'Enter' })).not.toThrow();
  });
});
