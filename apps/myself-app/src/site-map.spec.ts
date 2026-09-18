import { globSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';

import { describe, expect, it } from 'vitest';

import { SITE_PATHS, siteMapEntries, siteRobots } from './site-map';

const base = new URL('https://herber.example');

describe('the sitemap', () => {
  it('names every page under app/[locale]/, and nothing else', () => {
    const root = join(import.meta.dirname, 'app/[locale]');
    const pages = globSync('**/page.tsx', { cwd: root }).map(page => {
      const dir = relative('.', dirname(page));
      return dir === '' ? '/' : `/${dir}`;
    });
    expect([...SITE_PATHS].sort()).toEqual(pages.sort());
  });

  it('lists each page once per locale, absolute and with a trailing slash', () => {
    expect(siteMapEntries(base).map(entry => entry.url)).toEqual([
      'https://herber.example/en/',
      'https://herber.example/es/',
      'https://herber.example/en/cv/',
      'https://herber.example/es/cv/',
      'https://herber.example/en/tech-radar/',
      'https://herber.example/es/tech-radar/',
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

describe('robots.txt', () => {
  it('allows every crawler and points at the sitemap', () => {
    expect(siteRobots(base)).toEqual({
      rules: { userAgent: '*', allow: '/' },
      sitemap: 'https://herber.example/sitemap.xml',
    });
  });
});
