import { afterEach, describe, expect, it, vi } from 'vitest';

import { printSheet } from './print-sheet.js';

afterEach(() => {
  vi.restoreAllMocks();
  document.title = '';
});

describe('printing the sheet', () => {
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

    await printSheet('Herber Colop — CV');

    expect(print).toHaveBeenCalledOnce();
    expect(titleWhenPrinted).toEqual(['Herber Colop — CV']);
    expect(document.title).toBe('Herber Colop — CV');

    window.dispatchEvent(new Event('afterprint'));
    expect(document.title).toBe('CV: the page');
  });
});
