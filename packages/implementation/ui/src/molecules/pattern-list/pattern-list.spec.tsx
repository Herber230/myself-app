import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PatternList } from './pattern-list.js';

describe('a pattern list', () => {
  it('shows each pattern’s name and summary, in order', () => {
    render(
      <PatternList
        anchor="decisions"
        patterns={[
          { id: 'a', name: 'Ports', summary: 'Adapters behind ports.' },
          { id: 'b', name: 'Tiers', summary: 'Downward only.' },
        ]}
      />,
    );
    expect(
      screen
        .getAllByRole('heading', { level: 3 })
        .map(each => each.textContent),
    ).toEqual(['Ports', 'Tiers']);
    expect(screen.getByText('Downward only.')).toBeTruthy();
  });

  it('numbers each pattern, and links the records that decided it', () => {
    const { container } = render(
      <PatternList
        anchor="decisions"
        patterns={[
          {
            id: 'a',
            name: 'Ports',
            summary: 'Adapters behind ports.',
            decisions: [
              { number: '0001', label: 'ADR 0001' },
              { number: '0016', label: 'ADR 0016' },
            ],
          },
          { id: 'b', name: 'Tiers', summary: 'Downward only.', decisions: [] },
        ]}
      />,
    );
    expect(
      [...container.querySelectorAll('.pattern-card-number')].map(
        number => number.textContent,
      ),
    ).toEqual(['01', '02']);
    expect(
      screen
        .getAllByRole('link')
        .map(link => [link.textContent, link.getAttribute('href')]),
    ).toEqual([
      ['ADR 0001', '?adr=0001#decisions'],
      ['ADR 0016', '?adr=0016#decisions'],
    ]);
    // A pattern no record decided has no row of links.
    expect(container.querySelectorAll('.pattern-card-decisions')).toHaveLength(
      1,
    );
  });
});
