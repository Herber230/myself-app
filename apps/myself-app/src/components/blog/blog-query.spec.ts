/**
 * The blog's query string, and the build's and the browser's answers to it:
 * the browser reads `/data/post.json`, the build the content, through the
 * same use case. Both must keep the same posts.
 */
import { Post } from '@myself-app/domain';
import {
  loadThroughUseCase,
  staticJsonSource,
} from '@myself-app/entifix-browser';
import { describe, expect, it } from 'vitest';

import { dataFileContent } from '../../content/data-files';
import { SITE_CONTENT } from '../../content/repositories';
import { blogQuery } from './blog-query';

const query = blogQuery({
  tags: ['entifix', 'testing', 'infrastructure', 'static-sites'],
  technologies: ['effect', 'cloudfront'],
  years: ['2025', '2026'],
});

const idsOf = (posts: readonly Post[]) => posts.map(post => String(post.id));

describe('the blog filter', () => {
  it('keeps the same posts in the browser as at build', async () => {
    const file = await dataFileContent(SITE_CONTENT, 'post.json');
    const repository = await staticJsonSource(
      Post,
      '/data/post.json',
      (async () =>
        new Response(JSON.stringify(file))) as unknown as typeof fetch,
    )();
    const searches = [
      '',
      '?tag=entifix',
      '?tag=testing&tag=infrastructure',
      '?tech=cloudfront',
      '?year=2025',
      '?year=2026&tag=static-sites',
      '?q=S3',
      '?q=estático',
    ];
    for (const search of searches) {
      for (const locale of ['en', 'es'] as const) {
        const request = query.request<Post>(query.parse(search), locale);
        const [atBuild, inBrowser] = await Promise.all([
          SITE_CONTENT.loadAll(Post, {
            ...request,
            filtering: [
              { property: 'draft', operator: 'eq', value: false },
              ...(request.filtering ?? []),
            ],
          }),
          loadThroughUseCase<Post>(repository, {
            ...request,
            pageSize: Number.MAX_SAFE_INTEGER,
          }),
        ]);
        expect(idsOf(inBrowser.items), `${search} (${locale})`).toEqual(
          idsOf(atBuild),
        );
      }
    }
  });

  it('finds posts by tag, technology, year and title, newest first', async () => {
    const find = async (search: string, locale: 'en' | 'es' = 'en') =>
      idsOf(
        await SITE_CONTENT.loadAll(
          Post,
          query.request(query.parse(search), locale),
        ),
      );
    expect(await find('?tech=cloudfront')).toEqual(['a-static-site-on-s3']);
    expect(await find('?year=2025')).toEqual(['coverage-at-one-hundred']);
    expect(await find('?q=cobertura', 'es')).toEqual([
      'coverage-at-one-hundred',
    ]);
    expect((await find('?tag=entifix'))[0]).toBe('effect-four');
  });

  it('round-trips its URL, and drops what it does not know', () => {
    const search = '?tag=entifix&tech=effect&year=2026&q=use+case';
    expect(query.serialize(query.parse(search))).toBe(search);
    expect(query.parse('?tag=cobol&year=1999&tech=x')).toEqual(query.empty);
  });
});
