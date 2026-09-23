import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { paramsOf } from '../../test/render';
import LocaleLayout, { dynamicParams, generateStaticParams } from './layout';

type Props = Parameters<typeof LocaleLayout>[0];

/** The layout's document, parsed back from the HTML it renders. */
async function renderDocument(locale: string) {
  const element = await LocaleLayout({
    ...paramsOf({ locale }),
    children: <p>{'page'}</p>,
  } as Props);
  return new DOMParser().parseFromString(
    renderToStaticMarkup(element),
    'text/html',
  );
}

describe('the locale layout', () => {
  it('is built for every locale and no other', () => {
    expect(generateStaticParams()).toEqual([
      { locale: 'en' },
      { locale: 'es' },
    ]);
    expect(dynamicParams).toBe(false);
  });

  it("sets the page's language and paints its theme first", async () => {
    const document = await renderDocument('es');
    expect(document.documentElement.lang).toBe('es');
    expect(document.head.querySelector('script')?.textContent).toContain(
      'myself-app-theme',
    );
    expect(document.body.textContent).toContain('page');
  });

  it('is not found for an unknown locale', async () => {
    await expect(renderDocument('fr')).rejects.toThrow();
  });
});
