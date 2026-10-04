import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { OutlineLayout } from './outline-layout.js';

const two = [
  { id: 'overview', text: 'Overview', depth: 2 },
  { id: 'patterns', text: 'Patterns', depth: 2 },
] as const;

describe('a page beside its outline', () => {
  it('puts the outline in a column of its own, with two headings or more', () => {
    const { container } = render(
      <OutlineLayout entries={two} label="On this page" className="extra">
        <p>The page.</p>
      </OutlineLayout>,
    );
    const layout = container.firstElementChild as HTMLElement;
    expect(layout.className).toBe('outline-layout extra');
    expect(layout.hasAttribute('data-outlined')).toBe(true);
    expect(
      screen.getByRole('complementary').querySelector('nav'),
    ).not.toBeNull();
    expect(screen.getByRole('heading', { name: 'On this page' }).id).toBe(
      'page-outline-label',
    );
    expect(screen.getByText('The page.')).toBeTruthy();
  });

  it('has no outline with fewer than two headings to jump between', () => {
    const { container } = render(
      <OutlineLayout entries={two.slice(0, 1)} label="On this page" id="x">
        <p>The page.</p>
      </OutlineLayout>,
    );
    expect(
      (container.firstElementChild as HTMLElement).hasAttribute(
        'data-outlined',
      ),
    ).toBe(false);
    expect(screen.queryByRole('complementary')).toBeNull();
  });
});
