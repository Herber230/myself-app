/**
 * In `node`, as `next build` renders it: no `document`, so the painted theme is
 * unknown and the children render as they are.
 */
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Providers } from './providers';

describe('the providers, rendered at build', () => {
  it('render their children without a document to read', () => {
    const html = renderToStaticMarkup(
      <Providers
        locale="en"
        themeLabels={{ blue: 'Blue', light: 'Light', dark: 'Dark' }}
      >
        <p>page</p>
      </Providers>,
    );
    expect(html).toBe('<p>page</p>');
  });
});
