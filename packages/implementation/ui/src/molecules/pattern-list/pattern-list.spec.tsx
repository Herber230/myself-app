import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PatternList } from './pattern-list.js';

describe('a pattern list', () => {
  it('shows each pattern’s name and summary, in order', () => {
    render(
      <PatternList
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
});
