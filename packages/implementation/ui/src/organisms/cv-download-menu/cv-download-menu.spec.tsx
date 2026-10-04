import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CvDownloadMenu } from './cv-download-menu.js';

const copy = {
  more: 'More ways to keep it',
  print: 'Print or save as PDF',
  printHint: 'For a clean sheet: A4.',
  copyLink: 'Copy a link to this version',
  linkCopied: 'Link copied',
};

const menu = (
  <CvDownloadMenu fileName="Herber Colop — CV" copy={copy}>
    <a href="/cv.pdf">Download</a>
  </CvDownloadMenu>
);

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: undefined,
  });
});

describe('the CV’s download menu', () => {
  it('is the download alone in the static HTML', () => {
    const html = renderToString(menu);
    expect(html).toContain('Download');
    expect(html).not.toContain('<details');
  });

  it('offers printing, and no link to copy where there is no clipboard', () => {
    render(menu);
    expect(screen.getByRole('link', { name: 'Download' })).toBeTruthy();
    expect(
      screen.getByRole('button', { name: /^Print or save as PDF/ }),
    ).toBeTruthy();
    expect(
      screen.queryByRole('button', { name: 'Copy a link to this version' }),
    ).toBeNull();
  });

  it('closes itself as the print dialog opens', async () => {
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: { ready: Promise.resolve() },
    });
    const print = vi.spyOn(window, 'print').mockImplementation(() => undefined);
    const { container } = render(menu);
    const details = container.querySelector('details') as HTMLDetailsElement;
    details.open = true;
    fireEvent.click(
      screen.getByRole('button', { name: /^Print or save as PDF/ }),
    );
    await waitFor(() => expect(print).toHaveBeenCalledOnce());
    expect(details.open).toBe(false);
  });

  it('copies the address as it is, says so, then reads as before', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    window.history.replaceState(null, '', '/en/cv/?hide=tech:jest');
    const { container } = render(menu);
    const details = container.querySelector('details') as HTMLDetailsElement;
    details.open = true;
    await act(async () => {
      fireEvent.click(
        screen.getByRole('button', { name: 'Copy a link to this version' }),
      );
    });
    expect(writeText).toHaveBeenCalledWith(
      'http://localhost:3000/en/cv/?hide=tech:jest',
    );
    expect(screen.getByRole('status').textContent).toBe('Link copied');
    expect(details.open).toBe(false);
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByRole('status').textContent).toBe('');
    window.history.replaceState(null, '', '/');
  });
});
