import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import GlobalNotFound, { metadata } from './global-not-found';

describe('the 404 page', () => {
  it('speaks both languages and links to each home', () => {
    const document = new DOMParser().parseFromString(
      renderToStaticMarkup(<GlobalNotFound />),
      'text/html',
    );
    const sections = [...document.querySelectorAll('section')];
    expect(sections.map(section => section.lang)).toEqual(['en', 'es']);
    expect(
      sections.map(section => section.querySelector('a')?.getAttribute('href')),
    ).toEqual(['/en/', '/es/']);
    expect(document.body.textContent).toContain('Página no encontrada');
  });

  it('is not indexed', () => {
    expect(metadata.robots).toEqual({ index: false });
    expect(metadata.title).toBe('404 — Herber Colop');
  });
});
