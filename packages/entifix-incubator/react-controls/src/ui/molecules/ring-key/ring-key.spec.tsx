import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { RingKey } from './ring-key';

describe('the ring key', () => {
  it('pairs each ring with what it means, in order', () => {
    render(
      <RingKey
        rings={[
          { name: 'Adopt', meaning: 'I would choose it again.' },
          { name: 'Hold', meaning: 'I have moved away from it.' },
        ]}
      />,
    );
    expect(screen.getAllByRole('term').map(term => term.textContent)).toEqual([
      'Adopt',
      'Hold',
    ]);
    expect(
      screen.getAllByRole('definition').map(each => each.textContent),
    ).toEqual(['I would choose it again.', 'I have moved away from it.']);
  });
});
