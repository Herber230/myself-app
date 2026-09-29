import { describe, expect, it } from 'vitest';

import { siteMapEntries, siteRobots } from './site-map.js';

const base = new URL('https://herber.example');

describe('the sitemap', () => {
  it('lists each page once per locale, absolute and with a trailing slash', () => {
    expect(siteMapEntries(base).map(entry => entry.url)).toEqual([
      'https://herber.example/en/',
      'https://herber.example/es/',
      'https://herber.example/en/cv/',
      'https://herber.example/es/cv/',
      'https://herber.example/en/tech-radar/',
      'https://herber.example/es/tech-radar/',
      'https://herber.example/en/blog/',
      'https://herber.example/es/blog/',
    ]);
  });

  it('carries every language of a page, and the default as x-default', () => {
    const [, cvInSpanish] = siteMapEntries(base).filter(entry =>
      entry.url.includes('/cv/'),
    );
    expect(cvInSpanish.alternates?.languages).toEqual({
      en: 'https://herber.example/en/cv/',
      es: 'https://herber.example/es/cv/',
      'x-default': 'https://herber.example/en/cv/',
    });
  });
});

describe('the sitemap, given more paths', () => {
  it('lists those instead', () => {
    expect(
      siteMapEntries(base, ['/cv/backend']).map(entry => entry.url),
    ).toEqual([
      'https://herber.example/en/cv/backend/',
      'https://herber.example/es/cv/backend/',
    ]);
  });
});

describe('robots.txt', () => {
  it('allows every crawler and points at the sitemap', () => {
    expect(siteRobots(base)).toEqual({
      rules: { userAgent: '*', allow: '/' },
      sitemap: 'https://herber.example/sitemap.xml',
    });
  });
});
