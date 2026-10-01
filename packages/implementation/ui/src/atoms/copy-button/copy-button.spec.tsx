import { act, fireEvent, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CopyButton } from './copy-button.js';

const button = (
  <CopyButton
    value="a@b.c"
    label="Copy"
    name="Copy email address"
    copiedLabel="Copied"
    className="contact-card-copy"
  />
);

function stubClipboard(writeText?: (text: string) => Promise<void>) {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: writeText ? { writeText } : undefined,
  });
}

afterEach(() => {
  vi.useRealTimers();
  stubClipboard();
});

describe('the copy button', () => {
  it('is not in the static HTML, where there is no script to run it', () => {
    expect(renderToString(button)).toBe('');
  });

  it('is not shown where the browser cannot copy', () => {
    stubClipboard();
    render(button);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('copies the value, says so, then reads "Copy" again', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn(() => Promise.resolve());
    stubClipboard(writeText);
    render(button);

    const copy = screen.getByRole('button', { name: 'Copy email address' });
    expect(copy.className).toBe('contact-card-copy');
    expect(copy.hasAttribute('data-copied')).toBe(false);
    await act(async () => {
      fireEvent.click(copy);
    });

    expect(writeText).toHaveBeenCalledWith('a@b.c');
    expect(screen.getByRole('button', { name: 'Copied' })).toBe(copy);
    expect(copy.hasAttribute('data-copied')).toBe(true);
    expect(screen.getByRole('status').textContent).toBe('Copied');

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByRole('button', { name: 'Copy email address' })).toBe(
      copy,
    );
    expect(screen.getByRole('status').textContent).toBe('');
  });

  it('forgets its timer when it goes away before the time is up', async () => {
    vi.useFakeTimers();
    stubClipboard(() => Promise.resolve());
    const { unmount } = render(button);
    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
