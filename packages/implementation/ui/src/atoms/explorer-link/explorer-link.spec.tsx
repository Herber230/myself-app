import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ExplorerLink } from './explorer-link.js';

afterEach(() => {
  window.history.replaceState(null, '', '/en/projects/entifix/');
  document.body.innerHTML = '';
});

describe('a link to the explorer below', () => {
  it('is a plain link to the query and the anchor without scripting', () => {
    render(
      <ExplorerLink search="?status=accepted" anchor="decisions">
        See all
      </ExplorerLink>,
    );
    expect(
      screen.getByRole('link', { name: 'See all' }).getAttribute('href'),
    ).toBe('?status=accepted#decisions');
  });

  it('writes the query in place, tells the explorer, and scrolls to it', () => {
    window.history.replaceState(null, '', '/en/projects/entifix/?q=old');
    const target = document.createElement('section');
    target.id = 'decisions';
    target.scrollIntoView = vi.fn();
    document.body.append(target);
    const heard = vi.fn();
    window.addEventListener('entifix-url-search-changed', heard);
    render(
      <ExplorerLink search="?adr=0004" anchor="decisions" className="x">
        ADR 0004
      </ExplorerLink>,
    );
    const link = screen.getByRole('link', { name: 'ADR 0004' });
    expect(link.className).toBe('x');
    // A click it handles is not followed: the page does not load again.
    expect(fireEvent.click(link)).toBe(false);
    expect(window.location.pathname).toBe('/en/projects/entifix/');
    expect(window.location.search).toBe('?adr=0004');
    expect(window.location.hash).toBe('#decisions');
    expect(heard).toHaveBeenCalledOnce();
    expect(target.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    });
    window.removeEventListener('entifix-url-search-changed', heard);
  });

  it('writes the query even with nothing to scroll to', () => {
    render(
      <ExplorerLink search="?revised=yes" anchor="missing">
        Revised
      </ExplorerLink>,
    );
    fireEvent.click(screen.getByRole('link', { name: 'Revised' }));
    expect(window.location.search).toBe('?revised=yes');
  });
});
