import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { StatusBadge } from './status-badge.js';

describe('a status badge', () => {
  it('names the status, and marks it for its colour', () => {
    render(
      <StatusBadge status="superseded-in-part" label="Superseded in part" />,
    );
    const badge = screen.getByText('Superseded in part');
    expect(badge.dataset.status).toBe('superseded-in-part');
  });
});
