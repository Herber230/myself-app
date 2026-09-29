import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FilterFieldset } from './filter-fieldset';

describe('a filter fieldset', () => {
  it('groups its controls under its name', () => {
    render(
      <FilterFieldset label="Filter the list">
        <p>controls</p>
      </FilterFieldset>,
    );
    expect(screen.getByRole('group', { name: 'Filter the list' })).toBeTruthy();
    expect(screen.getByText('controls')).toBeTruthy();
  });
});
