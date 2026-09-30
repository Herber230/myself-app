import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DecisionLineage } from './decision-lineage.js';

const LABELS = { supersedes: 'Supersedes', supersededBy: 'Superseded by' };

describe('a decision’s lineage', () => {
  it('links what it replaces and what replaces it', () => {
    render(
      <DecisionLineage
        labels={LABELS}
        supersedes={[{ id: 'a-0001', label: 'ADR 0001 · One', href: '/one/' }]}
        supersededBy={[
          { id: 'a-0003', label: 'ADR 0003 · Three', href: '/three/' },
        ]}
      />,
    );
    expect(screen.getByText('Supersedes')).toBeTruthy();
    expect(
      screen
        .getByRole('link', { name: 'ADR 0003 · Three' })
        .getAttribute('href'),
    ).toBe('/three/');
  });

  it('leaves out a side with nothing, and is nothing with neither', () => {
    const { container, rerender } = render(
      <DecisionLineage
        labels={LABELS}
        supersedes={[{ id: 'a-0001', label: 'ADR 0001 · One', href: '/one/' }]}
        supersededBy={[]}
      />,
    );
    expect(screen.queryByText('Superseded by')).toBeNull();
    rerender(
      <DecisionLineage labels={LABELS} supersedes={[]} supersededBy={[]} />,
    );
    expect(container.innerHTML).toBe('');
  });
});
