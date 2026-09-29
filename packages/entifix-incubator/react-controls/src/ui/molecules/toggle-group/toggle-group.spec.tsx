import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ToggleGroup } from './toggle-group';

describe('a toggle group', () => {
  it('press the chips selected, and report the one toggled', () => {
    const onToggle = vi.fn();
    render(
      <ToggleGroup
        label="Tag"
        options={[
          { key: 'web', name: 'Web' },
          { key: 'data', name: 'Data' },
        ]}
        selected={['data']}
        onToggle={onToggle}
      />,
    );
    const group = screen.getByRole('group', { name: 'Tag' });
    expect(group).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Data' }).getAttribute('aria-pressed'),
    ).toBe('true');
    expect(
      screen.getByRole('button', { name: 'Web' }).getAttribute('aria-pressed'),
    ).toBe('false');
    fireEvent.click(screen.getByRole('button', { name: 'Web' }));
    expect(onToggle).toHaveBeenCalledWith('web');
  });
});
