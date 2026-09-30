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

  it('remembers being closed, and forgets once opened again', () => {
    const details = renderDetails();
    details.open = false;
    fireEvent(details, new Event('toggle'));
    expect(localStorage.getItem(KEY)).toBe('closed');
    details.open = true;
    fireEvent(details, new Event('toggle'));
    expect(localStorage.getItem(KEY)).toBeNull();
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
});
