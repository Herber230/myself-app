import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PageOutline } from './page-outline.js';

describe('a page’s outline', () => {
  it('links each heading, its subsections marked as such', () => {
    render(
      <PageOutline
        id="outline-label"
        label="On this page"
        entries={[
          { id: 'context', text: 'Context', depth: 2 },
          { id: 'measured', text: 'Measured', depth: 3 },
        ]}
      />,
    );
    const nav = screen.getByRole('navigation', { name: 'On this page' });
    expect(
      screen.getByRole('heading', { level: 2, name: 'On this page' }).id,
    ).toBe('outline-label');
    const links = within(nav).getAllByRole('link');
    expect(links.map(link => link.getAttribute('href'))).toEqual([
      '#context',
      '#measured',
    ]);
    expect(links.map(link => link.dataset['section'])).toEqual([
      'context',
      'measured',
    ]);
    expect(
      links.map(link => link.closest('li')?.getAttribute('data-depth')),
    ).toEqual(['2', '3']);
  });
});
