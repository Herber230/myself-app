import { fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { RememberedDetails } from './remembered-details.js';

const KEY = 'test-disclosure';

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

function renderDetails() {
  const { container } = render(
    <RememberedDetails storageKey={KEY} summary="How" className="extra">
      <p>{'Inside'}</p>
    </RememberedDetails>,
  );
  return container.querySelector('details') as HTMLDetailsElement;
}

describe('a remembered disclosure', () => {
  it('starts open, with its summary and class', () => {
    const details = renderDetails();
    expect(details.open).toBe(true);
    expect(details.className).toBe('extra');
    expect(details.querySelector('summary')?.textContent).toBe('How');
  });

  it('remembers being closed, and being opened again', () => {
    const details = renderDetails();
    details.open = false;
    fireEvent(details, new Event('toggle'));
    expect(localStorage.getItem(KEY)).toBe('closed');
    details.open = true;
    fireEvent(details, new Event('toggle'));
    expect(localStorage.getItem(KEY)).toBe('open');
  });

  it('starts closed when asked, and opens when it was opened before', () => {
    const { container, unmount } = render(
      <RememberedDetails storageKey={KEY} summary="How" defaultOpen={false}>
        <p>{'Inside'}</p>
      </RememberedDetails>,
    );
    expect(container.querySelector('details')?.open).toBe(false);
    unmount();
    localStorage.setItem(KEY, 'open');
    const again = render(
      <RememberedDetails storageKey={KEY} summary="How" defaultOpen={false}>
        <p>{'Inside'}</p>
      </RememberedDetails>,
    );
    expect(again.container.querySelector('details')?.open).toBe(true);
  });

  it('ignores a stored value it did not write', () => {
    localStorage.setItem(KEY, 'sideways');
    expect(renderDetails().open).toBe(true);
  });

  it('opens closed when it was closed before', () => {
    localStorage.setItem(KEY, 'closed');
    expect(renderDetails().open).toBe(false);
  });

  it('stays open when storage is refused', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied');
    });
    const details = renderDetails();
    expect(details.open).toBe(true);
    details.open = false;
    expect(() => fireEvent(details, new Event('toggle'))).not.toThrow();
  });

  it('ignores a toggle that arrives before the stored state is read', () => {
    localStorage.setItem(KEY, 'closed');
    const { container } = render(
      <RememberedDetails storageKey={KEY} summary="How">
        <p>{'Inside'}</p>
      </RememberedDetails>,
      {
        // Fire the load's toggle during the first render's commit, before
        // any effect runs.
        wrapper: ({ children }) => (
          <div
            ref={node => {
              node
                ?.querySelector('details')
                ?.dispatchEvent(new Event('toggle'));
            }}
          >
            {children}
          </div>
        ),
      },
    );
    expect(localStorage.getItem(KEY)).toBe('closed');
    expect(container.querySelector('details')?.open).toBe(false);
  });

  it('remembers being closed before the page was ready', () => {
    const { container } = render(
      <RememberedDetails storageKey={KEY} summary="How">
        <p>{'Inside'}</p>
      </RememberedDetails>,
      {
        wrapper: ({ children }) => (
          <div
            ref={node => {
              const details = node?.querySelector('details');
              if (details) details.open = false;
            }}
          >
            {children}
          </div>
        ),
      },
    );
    expect(container.querySelector('details')?.open).toBe(false);
    expect(localStorage.getItem(KEY)).toBe('closed');
  });

  it('remembers being opened before the page was ready', () => {
    const { container } = render(
      <RememberedDetails storageKey={KEY} summary="How" defaultOpen={false}>
        <p>{'Inside'}</p>
      </RememberedDetails>,
      {
        wrapper: ({ children }) => (
          <div
            ref={node => {
              const details = node?.querySelector('details');
              if (details) details.open = true;
            }}
          >
            {children}
          </div>
        ),
      },
    );
    expect(container.querySelector('details')?.open).toBe(true);
    expect(localStorage.getItem(KEY)).toBe('open');
  });
});
