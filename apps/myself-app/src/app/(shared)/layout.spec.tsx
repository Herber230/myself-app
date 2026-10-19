import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import SharedLayout, { metadata } from './layout';

describe('the shared pages’ layout', () => {
  it('is an English document wearing no site theme', () => {
    const document = new DOMParser().parseFromString(
      renderToStaticMarkup(
        <SharedLayout>
          <p>{'page'}</p>
        </SharedLayout>,
      ),
      'text/html',
    );
    expect(document.documentElement.lang).toBe('en');
    // A shared page carries its own palette: no theme to paint first.
    expect(document.head.querySelector('script')).toBeNull();
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
    expect(document.body.textContent).toBe('page');
  });

  it('keeps its pages out of search', () => {
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.metadataBase).toBeInstanceOf(URL);
  });
});
