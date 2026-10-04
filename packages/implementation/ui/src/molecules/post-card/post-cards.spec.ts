import type { PostPreview } from '@myself-app/domain/use-cases';
import { describe, expect, it } from 'vitest';

import { siteT } from '../../i18n/server.js';
import { formatDay, postCardOf, postPath } from './post-cards.js';

const PREVIEW: PostPreview = {
  id: 'static-sites',
  title: { en: 'Static sites', es: 'Sitios estáticos' },
  summary: { en: 'On S3.', es: 'En S3.' },
  publishedAt: '2026-09-27T00:00:00.000Z',
  draft: false,
  readingMinutes: { en: 3, es: 4 },
  tags: [{ id: 'web', label: { en: 'Web', es: 'Web' } }],
  technologies: [
    { id: 'amazon-s3', name: { en: 'Amazon S3', es: 'Amazon S3' } },
  ],
};

describe('a post’s card data', () => {
  it('is translated, formatted and linked for the reader', () => {
    expect(postCardOf(PREVIEW, 'es', siteT('es'))).toEqual({
      id: 'static-sites',
      href: '/es/blog/static-sites/',
      title: 'Sitios estáticos',
      summary: 'En S3.',
      publishedAt: '2026-09-27T00:00:00.000Z',
      date: '27 sept 2026',
      readingTime: '4 min de lectura',
      tags: [{ id: 'web', label: 'Web' }],
      technologies: [{ id: 'amazon-s3', name: 'Amazon S3' }],
    });
  });

  it('says a draft is one', () => {
    expect(
      postCardOf({ ...PREVIEW, draft: true }, 'en', siteT('en')).draft,
    ).toBe('Draft');
  });

  it('writes the day as the reader does, in UTC', () => {
    expect(formatDay(new Date('2026-06-01T00:00:00.000Z'), 'en')).toBe(
      'Jun 1, 2026',
    );
    expect(postPath('en', 'x')).toBe('/en/blog/x/');
  });
});
