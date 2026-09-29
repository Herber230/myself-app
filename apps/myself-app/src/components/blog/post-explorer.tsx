'use client';

/**
 * The blog's posts with their filter (ADR 0016, 0017): the one client part of
 * the blog's home.
 *
 * The filter is the query string, read once hydrated, and answered by
 * entifix's `load` use case over `/data/post.json`. The cards are the build's,
 * shown or not by the answer's ids, as a timeline beside the filter. The static
 * HTML lists every post, which is also what a visitor without scripting gets.
 */
import { Lead, Stack, Text } from '@entifix/react-controls/primitives';
import { Post } from '@myself-app/domain/entities/post';
import { staticJsonSource } from '@myself-app/entifix-browser';
import { useUrlFilter } from '@myself-app/entifix-browser/react';
import { useMemo } from 'react';

import { localePath } from '../../locale-path';
import type { SiteLocale } from '../../site-locales';
import { FilterFieldset, FilterSummary, ToggleGroup } from '../filters';
import { BlogLayout } from './blog-layout';
import { type BlogParam, blogQuery } from './blog-query';
import { FilterLinks } from './filter-links';
import type { PostCardData } from './post-card';
import { PostTimeline } from './post-timeline';

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
  /** The sidebar toggle's names, closed and open. */
  readonly showSidebar: string;
  readonly hideSidebar: string;
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
  /** Above the timeline: the blog's title and what it is about. */
  readonly title: string;
  readonly lead: string;
  /** At the sidebar's foot: the feed. */
  readonly feed: { readonly href: string; readonly label: string };
}

export function PostExplorer({
  posts,
  locale,
  tags,
  technologies,
  years,
  copy,
  title,
  lead,
  feed,
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
  // `filter` is `null` in the static HTML, which lists every post, and the
  // filter as links that reload the page filtered.
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
  const yearOptions = years.map(year => ({ key: year, name: year }));

  const sidebar = (
    <Stack gap="l">
      <Stack gap="s">
        <h2 className="blog-sidebar-heading">{copy.filters}</h2>
        {filter === null ? (
          <FilterLinks
            blogPath={localePath(locale, '/blog')}
            groups={[
              { param: 'tag', label: copy.tag, options: options(tags) },
              {
                param: 'tech',
                label: copy.technology,
                options: options(technologies),
              },
              { param: 'year', label: copy.year, options: yearOptions },
            ]}
          />
        ) : (
          <FilterFieldset label={copy.filters}>
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
              options={yearOptions}
              selected={filter.year}
              onToggle={year => toggle('year', year)}
            />
          </FilterFieldset>
        )}
      </Stack>
      <a href={feed.href} className="blog-feed-link">
        {feed.label}
      </a>
    </Stack>
  );

  return (
    <BlogLayout
      sidebar={sidebar}
      sidebarOpen
      copy={{
        label: copy.filters,
        show: copy.showSidebar,
        hide: copy.hideSidebar,
      }}
    >
      <Stack gap="xl">
        <header className="blog-header">
          <Text as="h1" step={3} weight="semibold">
            {title}
          </Text>
          <Lead muted>{lead}</Lead>
        </header>
        {shown.length === 0 ? (
          <Text muted>{copy.empty}</Text>
        ) : (
          <PostTimeline posts={shown} />
        )}
      </Stack>
    </BlogLayout>
  );
}
