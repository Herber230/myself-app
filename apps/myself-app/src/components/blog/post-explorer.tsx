'use client';

/**
 * The blog's posts with their filter (ADR 0016, 0017): the one client part of
 * the blog's home.
 *
 * The filter is the query string, read once hydrated, and answered by
 * entifix's `load` use case over `/data/post.json`. The cards are the build's,
 * shown or not by the answer's ids. The static HTML lists every post, which is
 * also what a visitor without scripting gets.
 */
import { Stack, Text } from '@entifix/react-controls/primitives';
import { Post } from '@myself-app/domain/entities/post';
import { staticJsonSource } from '@myself-app/entifix-browser';
import { useUrlFilter } from '@myself-app/entifix-browser/react';
import { useMemo } from 'react';

import type { SiteLocale } from '../../site-locales';
import { FilterFieldset, FilterSummary, ToggleGroup } from '../filters';
import { type BlogParam, blogQuery } from './blog-query';
import { PostCard, type PostCardData } from './post-card';

/** Every published post, as the export writes them (ADR 0017). */
const POSTS = staticJsonSource(Post, '/data/post.json');

/** Every string the controls show, translated at build. */
export interface PostExplorerCopy {
  readonly filters: string;
  readonly tag: string;
  readonly technology: string;
  readonly year: string;
  readonly search: string;
  readonly clear: string;
  /** `{{shown}}` and `{{total}}` are replaced. */
  readonly showing: string;
  readonly empty: string;
}

type Option = { readonly id: string; readonly name: string };

export interface PostExplorerProps {
  /** Every post, newest first. */
  readonly posts: readonly PostCardData[];
  readonly locale: SiteLocale;
  readonly tags: readonly Option[];
  readonly technologies: readonly Option[];
  /** Every year a post was published in, newest first. */
  readonly years: readonly string[];
  readonly copy: PostExplorerCopy;
}

export function PostExplorer({
  posts,
  locale,
  tags,
  technologies,
  years,
  copy,
}: PostExplorerProps) {
  const query = useMemo(
    () =>
      blogQuery({
        tags: tags.map(tag => tag.id),
        technologies: technologies.map(technology => technology.id),
        years,
      }),
    [tags, technologies, years],
  );
  // `filter` is `null` in the static HTML, which lists every post and no
  // controls.
  const { filter, filtering, kept, toggle, set, clear } = useUrlFilter<
    BlogParam,
    SiteLocale,
    Post
  >(POSTS, query, locale);
  const shown = useMemo(
    () =>
      kept === undefined ? posts : posts.filter(post => kept.has(post.id)),
    [kept, posts],
  );
  const options = (list: readonly Option[]) =>
    list.map(each => ({ key: each.id, name: each.name }));

  return (
    <Stack gap="l">
      {filter !== null && (
        <FilterFieldset label={copy.filters}>
          <ToggleGroup
            label={copy.tag}
            options={options(tags)}
            selected={filter.tag}
            onToggle={tag => toggle('tag', tag)}
          />
          <ToggleGroup
            label={copy.technology}
            options={options(technologies)}
            selected={filter.tech}
            onToggle={tech => toggle('tech', tech)}
          />
          <ToggleGroup
            label={copy.year}
            options={years.map(year => ({ key: year, name: year }))}
            selected={filter.year}
            onToggle={year => toggle('year', year)}
          />
          <FilterSummary
            searchLabel={copy.search}
            search={filter.q[0] ?? ''}
            onSearch={text => set('q', [text])}
            showing={copy.showing
              .replace('{{shown}}', String(shown.length))
              .replace('{{total}}', String(posts.length))}
            clearLabel={copy.clear}
            onClear={filtering ? clear : undefined}
          />
        </FilterFieldset>
      )}
      {shown.length === 0 ? (
        <Text muted>{copy.empty}</Text>
      ) : (
        <ol className="post-list">
          {shown.map(post => (
            <li key={post.id}>
              <PostCard post={post} />
            </li>
          ))}
        </ol>
      )}
    </Stack>
  );
}
