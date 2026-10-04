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
import { Stack, Text } from '@entifix/react-controls/primitives';
import { Post } from '@myself-app/domain/entities/post';
import { useUrlFilter } from '@myself-app/entifix-incubator-browser/react';
import {
  ActiveFilters,
  activeFiltersOf,
  FilterFieldset,
  FilterPanel,
  FilterSummary,
  ToggleGroup,
  useMediaQuery,
} from '@myself-app/entifix-incubator-react-controls';
import { useMemo } from 'react';

import { SlidersIcon } from '../../atoms/icons/icons.js';
import { fill } from '../../i18n/fill.js';
import { FilterLinks } from '../../molecules/filter-links/filter-links.js';
import { PageHeader } from '../../molecules/page-header/page-header.js';
import type { PostCardData } from '../../molecules/post-card/post-card.js';
import { localePath } from '../../routing/locale-path.js';
import type { SiteLocale } from '../../routing/site-locales.js';
import { useSources } from '../../sources/sources.js';
import { BlogLayout } from '../../templates/blog-layout/blog-layout.js';
import { WIDE } from '../../theme/breakpoints.js';
import { PostTimeline } from '../post-timeline/post-timeline.js';
import { type BlogParam, blogQuery } from './blog-query.js';

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
  /** What to type, while the search is empty. */
  readonly placeholder: string;
  /** `{{n}}` is replaced: the card's count of what is in force. */
  readonly active: string;
  /** `{{name}}` is replaced: an active filter's remove button. */
  readonly remove: string;
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
  const sources = useSources();
  const { filter, filtering, kept, toggle, set, clear } = useUrlFilter<
    BlogParam,
    SiteLocale,
    Post
  >(sources.posts, query, locale);
  const shown = useMemo(
    () =>
      kept === undefined ? posts : posts.filter(post => kept.has(post.id)),
    [kept, posts],
  );
  const options = (list: readonly Option[]) =>
    list.map(each => ({ key: each.id, name: each.name }));
  const yearOptions = years.map(year => ({ key: year, name: year }));
  // Open beside the timeline; closed on a phone, where the rows would push
  // the posts a screen down. The search and the active chips stay in view.
  const wide = useMediaQuery(WIDE, true);

  // What is in force, in the rows' order, each chip removing its value.
  const active =
    filter === null
      ? []
      : activeFiltersOf({
          groups: [
            { param: 'tag', label: copy.tag, options: options(tags) },
            {
              param: 'tech',
              label: copy.technology,
              options: options(technologies),
            },
            { param: 'year', label: copy.year, options: yearOptions },
          ],
          selected: param => filter[param],
          search: { label: copy.search, text: filter.q[0] ?? '' },
          removeLabel: name => fill(copy.remove, { name }),
          onToggle: toggle,
          onClearSearch: () => set('q', []),
        });

  const sidebar = (
    <Stack gap="l">
      {filter === null ? (
        <Stack gap="s">
          <h2 className="blog-sidebar-heading">{copy.filters}</h2>
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
        </Stack>
      ) : (
        <FilterPanel
          title={copy.filters}
          icon={<SlidersIcon className="size-[1.1em]" />}
          activeLabel={
            active.length > 0
              ? fill(copy.active, { n: active.length })
              : undefined
          }
          open={wide}
          footer={
            <FilterSummary
              searchLabel={copy.search}
              search={filter.q[0] ?? ''}
              onSearch={text => set('q', [text])}
              placeholder={copy.placeholder}
              showing={fill(copy.showing, {
                shown: shown.length,
                total: posts.length,
              })}
              clearLabel={copy.clear}
              onClear={filtering ? clear : undefined}
            >
              {active.length > 0 && <ActiveFilters active={active} />}
            </FilterSummary>
          }
        >
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
              options={yearOptions}
              selected={filter.year}
              onToggle={year => toggle('year', year)}
            />
          </FilterFieldset>
        </FilterPanel>
      )}
      <a href={feed.href} className="blog-feed-link">
        {feed.label}
      </a>
    </Stack>
  );

  return (
    <BlogLayout
      header={<PageHeader title={title} lead={lead} className="blog-header" />}
      sidebar={sidebar}
      sidebarOpen
      copy={{
        label: copy.filters,
        show: copy.showSidebar,
        hide: copy.hideSidebar,
      }}
    >
      <Stack gap="xl">
        {shown.length === 0 ? (
          <Text muted>{copy.empty}</Text>
        ) : (
          <PostTimeline posts={shown} />
        )}
      </Stack>
    </BlogLayout>
  );
}
