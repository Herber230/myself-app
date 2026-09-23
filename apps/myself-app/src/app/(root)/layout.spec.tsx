import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import RootRedirectLayout from './layout';

describe('the root layout', () => {
  it('is an English document that paints its theme first', () => {
    const document = new DOMParser().parseFromString(
      renderToStaticMarkup(
        <RootRedirectLayout>
          <p>{'page'}</p>
        </RootRedirectLayout>,
      ),
      'text/html',
    );
    expect(document.documentElement.lang).toBe('en');
    expect(document.head.querySelector('script')).not.toBeNull();
    expect(document.body.textContent).toBe('page');
  });
});
