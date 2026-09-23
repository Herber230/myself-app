import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import RootRedirectPage, { metadata } from './page';

describe('the root page', () => {
  it('moves the visitor to the default locale, and links there', () => {
    // As the export writes it: a refresh that needs no script, and a link.
    const page = new DOMParser().parseFromString(
      renderToStaticMarkup(<RootRedirectPage />),
      'text/html',
    );
    expect(
      page.querySelector('meta[http-equiv="refresh"]')?.getAttribute('content'),
    ).toBe('0; url=/en/');
    const link = page.querySelector('a');
    expect(link?.getAttribute('href')).toBe('/en/');
    expect(link?.textContent).toBe('Continue to the English site');
  });

  it('is not indexed, and points search at the locale', () => {
    expect(metadata.robots).toEqual({ index: false });
    expect(metadata.alternates?.canonical).toBe('/en/');
  });
});
