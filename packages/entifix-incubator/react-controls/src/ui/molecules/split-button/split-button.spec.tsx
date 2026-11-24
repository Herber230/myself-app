import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SplitButton } from './split-button';

describe('a split button', () => {
  it('is the main action alone without entries', () => {
    const { container } = render(
      <SplitButton primary={<a href="/cv.pdf">Download</a>} menuLabel="More" />,
    );
    expect(screen.getByRole('link', { name: 'Download' })).toBeTruthy();
    expect(container.querySelector('details')).toBeNull();
    expect(
      container.querySelector('[data-slot="split-button"]')?.className,
    ).not.toContain('rounded-r-none');
  });

  it('joins a menu of entries to the main action', () => {
    const { container } = render(
      <SplitButton
        primary={<a href="/cv.pdf">Download</a>}
        menuLabel="More"
        className="extra"
      >
        <button type="button">Print</button>
      </SplitButton>,
    );
    const root = container.querySelector('[data-slot="split-button"]');
    expect(root?.className).toContain('extra');
    expect(root?.className).toContain('rounded-r-none');
    const trigger = screen.getByTitle('More');
    expect(trigger.className).toContain('rounded-l-none');
    const menu = trigger.closest('details') as HTMLDetailsElement;
    expect(menu.open).toBe(false);
    expect(
      screen.getByRole('button', { name: 'Print', hidden: true }),
    ).toBeTruthy();
  });
});
