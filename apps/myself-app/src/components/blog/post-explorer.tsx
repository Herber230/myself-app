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
import { useEntityLoad, useUrlState } from '@myself-app/entifix-browser/react';
import { useMemo } from 'react';

import type { SiteLocale } from '../../site-locales';
import {
  FilterFieldset,
  FilterSummary,
  toggled,
  ToggleGroup,
} from '../filters';
import { blogQuery } from './blog-query';
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
  // `null` in the static HTML, which lists every post and no controls.
  const [filter, update] = useUrlState(query);
  const filtering = filter !== null && !query.isEmpty(filter);
  const load = useEntityLoad<Post>(
    POSTS,
    filtering ? query.request(filter, locale) : null,
  );
  // While a new answer is on its way, the last one stays on screen.
  const page =
    load.status === 'done'
      ? load.page
      : load.status === 'pending'
        ? load.previous
        : undefined;
  const shown = useMemo(() => {
    if (page === undefined) return posts;
    const kept = new Set(page.items.map(post => String(post.id)));
    return posts.filter(post => kept.has(post.id));
  }, [page, posts]);
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
            onToggle={tag =>
              update({ ...filter, tag: toggled(filter.tag, tag) })
            }
          />
          <ToggleGroup
            label={copy.technology}
            options={options(technologies)}
            selected={filter.tech}
            onToggle={tech =>
              update({ ...filter, tech: toggled(filter.tech, tech) })
            }
          />
          <ToggleGroup
            label={copy.year}
            options={years.map(year => ({ key: year, name: year }))}
            selected={filter.year}
            onToggle={year =>
              update({ ...filter, year: toggled(filter.year, year) })
            }
          />
          <FilterSummary
            searchLabel={copy.search}
            search={filter.q[0] ?? ''}
            onSearch={text => update({ ...filter, q: [text] })}
            showing={copy.showing
              .replace('{{shown}}', String(shown.length))
              .replace('{{total}}', String(posts.length))}
            clearLabel={copy.clear}
            onClear={filtering ? () => update(query.empty) : undefined}
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
