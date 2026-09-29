/**
 * The blog's filter as links to the blog's home (ADR 0016, 0017): what a post's
 * sidebar shows, and what the home's shows until its filter is hydrated. Each
 * chip opens the home filtered on that one value.
 */
import { FilterRow } from '@myself-app/entifix-incubator-react-controls';
import Link from 'next/link';

import type { BlogParam } from '../../organisms/post-explorer/blog-query.js';

export interface FilterLinkGroup {
  readonly param: Exclude<BlogParam, 'q'>;
  readonly label: string;
  readonly options: readonly { readonly key: string; readonly name: string }[];
}

export function FilterLinks({
  blogPath,
  groups,
}: {
  /** The blog's home, with its trailing slash. */
  blogPath: string;
  groups: readonly FilterLinkGroup[];
}) {
  return (
    <div data-slot="filter-links" className="text-[0.875rem]">
      {groups.map(group => (
        <FilterRow
          key={group.param}
          role="group"
          aria-label={group.label}
          label={group.label}
        >
          {group.options.map(option => (
            <Link
              key={option.key}
              href={`${blogPath}?${group.param}=${encodeURIComponent(option.key)}`}
              className="landing-chip"
            >
              {option.name}
            </Link>
          ))}
        </FilterRow>
      ))}
    </div>
  );
}
