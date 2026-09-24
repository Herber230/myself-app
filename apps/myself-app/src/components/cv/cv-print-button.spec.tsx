import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CvPrintButton } from './cv-print-button';

const button = <CvPrintButton label="Print" fileName="Herber Colop — CV" />;

afterEach(() => {
  vi.restoreAllMocks();
  document.title = '';
});

describe('the print button', () => {
  it('is not in the static HTML, where there is no script to run it', () => {
    expect(renderToString(button)).toBe('');
  });

  it('names the file, waits for the fonts, prints, then puts the title back', async () => {
    document.title = 'CV: the page';
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: { ready: Promise.resolve() },
    });
    const titleWhenPrinted: string[] = [];
    const print = vi
      .spyOn(window, 'print')
      .mockImplementation(() => titleWhenPrinted.push(document.title));

    render(button);
    fireEvent.click(screen.getByRole('button', { name: 'Print' }));

    await waitFor(() => expect(print).toHaveBeenCalledOnce());
    expect(titleWhenPrinted).toEqual(['Herber Colop — CV']);
    expect(document.title).toBe('Herber Colop — CV');

    window.dispatchEvent(new Event('afterprint'));
    expect(document.title).toBe('CV: the page');
  });
});
