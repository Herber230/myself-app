import { loadPosts } from '@myself-app/domain/use-cases';
import { describe, expect, it } from 'vitest';

import { SITE_CONTENT } from '../composition';
import { escapeXml, renderFeed } from './feed';

const BASE = new URL('https://herber.example');

describe('the blog’s feed', () => {
  it('lists every published post, newest first, with absolute links', async () => {
    const feed = renderFeed(await loadPosts(SITE_CONTENT), 'es', BASE);
    expect(feed.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(
      true,
    );
    expect(feed).toContain('<title>Herber Colop — Blog</title>');
    expect(feed).toContain('<link>https://herber.example/es/blog/</link>');
    expect(feed).toContain('<language>es</language>');
    const links = [...feed.matchAll(/<guid isPermaLink="true">([^<]+)</g)].map(
      match => match[1],
    );
    expect(links).toEqual([
      'https://herber.example/es/blog/entifix-in-the-browser/',
      'https://herber.example/es/blog/a-static-site-on-s3/',
      'https://herber.example/es/blog/coverage-at-one-hundred/',
      'https://herber.example/es/blog/then-i-saw-you-dance/',
      'https://herber.example/es/blog/books/',
      'https://herber.example/es/blog/rxjs-exceptions-react-hooks/',
      'https://herber.example/es/blog/what-do-you-think/',
      'https://herber.example/es/blog/the-first-entifix-application/',
      'https://herber.example/es/blog/the-embodiment-of-irony/',
      'https://herber.example/es/blog/an-analogy-for-life-plans/',
    ]);
    expect(feed).toContain('<pubDate>Fri, 12 Jun 2026 00:00:00 GMT</pubDate>');
  });

  it('escapes what XML would read as markup', () => {
    expect(escapeXml('a < b & "c" > d')).toBe(
      'a &lt; b &amp; &quot;c&quot; &gt; d',
    );
  });
});
