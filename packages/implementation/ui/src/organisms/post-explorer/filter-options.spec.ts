import type { PostPreview } from '@myself-app/domain/use-cases';
import { describe, expect, it } from 'vitest';

import { filterOptionsOf } from './filter-options.js';

const preview = (
  id: string,
  publishedAt: string,
  tags: [string, string][],
  technologies: [string, string][],
): PostPreview =>
  ({
    id,
    publishedAt,
    tags: tags.map(([tag, en]) => ({
      id: tag,
      label: { en, es: `${en} (es)` },
    })),
    technologies: technologies.map(([technology, en]) => ({
      id: technology,
      name: { en, es: en },
    })),
  }) as unknown as PostPreview;

describe("the blog filter's options", () => {
  const previews = [
    preview(
      'b',
      '2026-03-01T00:00:00.000Z',
      [['web', 'Web']],
      [['ts', 'TypeScript']],
    ),
    preview(
      'a',
      '2025-01-01T00:00:00.000Z',
      [
        ['testing', 'Testing'],
        ['web', 'Web'],
      ],
      [['aws', 'Amazon S3']],
    ),
    preview('c', '2025-06-01T00:00:00.000Z', [], []),
  ];

  it('names every tag and technology once, sorted in the reader’s language', () => {
    const options = filterOptionsOf(previews, 'es');
    expect(options.tags).toEqual([
      { id: 'testing', name: 'Testing (es)' },
      { id: 'web', name: 'Web (es)' },
    ]);
    expect(options.technologies.map(each => each.id)).toEqual(['aws', 'ts']);
  });

  it('lists every year a post was published in, newest first', () => {
    expect(filterOptionsOf(previews, 'en').years).toEqual(['2026', '2025']);
  });
});
