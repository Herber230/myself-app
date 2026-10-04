'use client';

/**
 * A project's decision records with their filter and sort (#77): the one
 * client part of a project's page.
 *
 * The filter and the sort are the query string, read once hydrated, and
 * answered by entifix's `load` use case over `/data/adr.json`. The rows are
 * the build's, kept and ordered by the answer: a timeline of every record,
 * then a list beside a pane that shows the chosen one (`?adr=0016`, else the
 * first shown), so twenty records take one screen rather than twenty. The
 * static HTML lists every record by number, each a link to its page, which
 * is also what a visitor without scripting gets.
 */
import { ArchitectureDecision } from '@myself-app/domain/entities/architecture-decision';
import { useUrlFilter } from '@myself-app/entifix-incubator-browser/react';
import {
  ActiveFilters,
  activeFiltersOf,
  FilterFieldset,
  FilterPanel,
  FilterSummary,
  SortControl,
  SplitView,
  ToggleGroup,
  useMediaQuery,
} from '@myself-app/entifix-incubator-react-controls';
import Link from 'next/link';
import { useMemo } from 'react';

import { SlidersIcon } from '../../atoms/icons/icons.js';
import { InlineCode } from '../../atoms/inline-code/inline-code.js';
import { StatusBadge } from '../../atoms/status-badge/status-badge.js';
import { fill } from '../../i18n/fill.js';
import {
  DecisionLineage,
  type LineageLink,
} from '../../molecules/decision-lineage/decision-lineage.js';
import { DecisionTimeline } from '../../molecules/decision-timeline/decision-timeline.js';
import { useSources } from '../../sources/sources.js';
import { NOT_NARROW, NOT_WIDE } from '../../theme/breakpoints.js';
import {
  type DecisionParam,
  decisionQuery,
  SORT_FIELDS,
  sortChoiceOf,
  sortValueOf,
} from './decision-query.js';

/** One record as its row shows it, translated at build. */
export interface DecisionRow {
  readonly id: string;
  /** Four digits: `0016`. */
  readonly number: string;
  readonly title: string;
  readonly status: string;
  readonly statusLabel: string;
  /** ISO, for `<time>`. */
  readonly date: string;
  readonly dateLabel: string;
  /** The day, short, for the timeline: `Sep 17`. */
  readonly dayLabel: string;
  readonly area: string;
  readonly readWhen?: string;
  /** The decision, a point per line of its summary. */
  readonly points: readonly string[];
  readonly supersedes: readonly LineageLink[];
  readonly supersededBy: readonly LineageLink[];
  readonly href: string;
}

/** Every string the controls show, translated at build. */
export interface DecisionExplorerCopy {
  readonly label: string;
  readonly status: string;
  readonly area: string;
  readonly search: string;
  /** What to type, while the search is empty. */
  readonly placeholder: string;
  /** `{{n}}` is replaced: the card's count of what is in force. */
  readonly active: string;
  /** `{{name}}` is replaced: an active filter's remove button. */
  readonly remove: string;
  readonly clear: string;
  /** `{{shown}}` and `{{total}}` are replaced. */
  readonly showing: string;
  readonly empty: string;
  readonly sort: string;
  readonly ascending: string;
  readonly descending: string;
  readonly readWhen: string;
  readonly timeline: string;
  readonly points: string;
  readonly open: string;
  readonly supersedes: string;
  readonly supersededBy: string;
  readonly sortFields: Readonly<Record<(typeof SORT_FIELDS)[number], string>>;
}

type Option = { readonly key: string; readonly name: string };

export interface DecisionExplorerProps {
  /** Every record of the project, by number. */
  readonly decisions: readonly DecisionRow[];
  readonly statuses: readonly Option[];
  readonly areas: readonly Option[];
  readonly copy: DecisionExplorerCopy;
}

/** The direction each field starts in: the newest record first, say. */
const INITIAL = { date: 'desc' } as const;

export function DecisionExplorer({
  decisions,
  statuses,
  areas,
  copy,
}: DecisionExplorerProps) {
  const query = useMemo(
    () =>
      decisionQuery({
        statuses: statuses.map(status => status.key),
        areas: areas.map(area => area.key),
        numbers: decisions.map(row => row.number),
      }),
    [statuses, areas, decisions],
  );
  const sources = useSources();
  const { filter, filtering, kept, order, toggle, set, clear } = useUrlFilter<
    DecisionParam,
    undefined,
    ArchitectureDecision
  >(sources.decisions, query, undefined);

  // The answer holds every project's records; the rows are this project's.
  const shown = useMemo(() => {
    if (order === undefined) return decisions;
    const byId = new Map(decisions.map(row => [row.id, row]));
    return order.flatMap(id => {
      const row = byId.get(id);
      return row === undefined ? [] : [row];
    });
  }, [decisions, order]);
  // The record the URL names, while the filter shows it; else the first.
  const chosen = shown.find(row => row.number === filter?.adr[0]) ?? shown[0];
  // The rows start open beside nothing; on a phone, closed over the list.
  const open = useMediaQuery(NOT_NARROW, true);
  // Below the wide layout the list is an accordion: a chosen row's record
  // opens under it, so the row is brought to the top to read it from.
  const stacked = useMediaQuery(NOT_WIDE, false);
  const choose = (id: string) => {
    const row = decisions.find(each => each.id === id) as DecisionRow;
    set('adr', [row.number]);
    if (stacked)
      requestAnimationFrame(() =>
        document
          .querySelector(`[data-adr="${id}"]`)
          ?.closest('[data-slot="split-row"]')
          ?.scrollIntoView({ block: 'start' }),
      );
  };

  const active =
    filter === null
      ? []
      : activeFiltersOf({
          groups: [
            { param: 'status', label: copy.status, options: statuses },
            { param: 'area', label: copy.area, options: areas },
          ],
          selected: param => filter[param],
          search: { label: copy.search, text: filter.q[0] ?? '' },
          removeLabel: name => fill(copy.remove, { name }),
          onToggle: toggle,
          onClearSearch: () => set('q', []),
        });

  return (
    <div className="adr-explorer">
      {filter !== null && (
        <FilterPanel
          title={copy.label}
          icon={<SlidersIcon className="size-[1.1em]" />}
          activeLabel={
            active.length > 0
              ? fill(copy.active, { n: active.length })
              : undefined
          }
          open={open}
          footer={
            <div className="adr-filter-footer">
              <FilterSummary
                searchLabel={copy.search}
                search={filter.q[0] ?? ''}
                onSearch={text => set('q', [text])}
                placeholder={copy.placeholder}
                showing={fill(copy.showing, {
                  shown: shown.length,
                  total: decisions.length,
                })}
                clearLabel={copy.clear}
                onClear={filtering ? clear : undefined}
              >
                {active.length > 0 && <ActiveFilters active={active} />}
              </FilterSummary>
              <SortControl
                label={copy.sort}
                fields={SORT_FIELDS.map(field => ({
                  key: field,
                  name: copy.sortFields[field],
                  ...(field in INITIAL && {
                    initial: INITIAL[field as keyof typeof INITIAL],
                  }),
                }))}
                value={sortChoiceOf(filter.sort[0])}
                directionLabels={{ asc: copy.ascending, desc: copy.descending }}
                onChange={choice => set('sort', [sortValueOf(choice)])}
              />
            </div>
          }
        >
          <FilterFieldset label={copy.label}>
            <ToggleGroup
              label={copy.status}
              options={statuses}
              selected={filter.status}
              onToggle={status => toggle('status', status)}
            />
            <ToggleGroup
              label={copy.area}
              options={areas}
              selected={filter.area}
              onToggle={area => toggle('area', area)}
            />
          </FilterFieldset>
        </FilterPanel>
      )}
      <DecisionTimeline
        label={copy.timeline}
        decisions={decisions.map(row => ({
          ...row,
          supersedes: row.supersedes.map(link => link.id),
        }))}
        kept={kept}
        selected={chosen?.id}
        onSelect={choose}
      />
      {shown.length === 0 ? (
        <p className="adr-empty">{copy.empty}</p>
      ) : (
        <SplitView
          label={copy.label}
          className="adr-split"
          selected={chosen?.id}
          onSelect={choose}
          items={shown.map(row => ({
            id: row.id,
            href: row.href,
            head: (
              <span className="adr-row-head" data-adr={row.id}>
                <span className="adr-row-number">{row.number}</span>
                <span className="adr-row-title">{row.title}</span>
                <StatusBadge status={row.status} label={row.statusLabel} />
              </span>
            ),
            detail: <DecisionDetail row={row} copy={copy} />,
          }))}
        />
      )}
    </div>
  );
}

/** The pane: what an agent would read the record for, then the way to it. */
function DecisionDetail({
  row,
  copy,
}: {
  row: DecisionRow;
  copy: DecisionExplorerCopy;
}) {
  return (
    <article className="adr-detail">
      <h3 className="adr-detail-title">
        <span className="adr-row-number">{row.number}</span>
        {row.title}
      </h3>
      {row.readWhen && (
        <p className="adr-row-read-when">
          <span className="adr-row-read-when-label">{copy.readWhen}</span>
          <span>
            <InlineCode text={row.readWhen} />
          </span>
        </p>
      )}
      <h4 className="adr-detail-heading">{copy.points}</h4>
      <ul className="adr-detail-points">
        {row.points.map(point => (
          <li key={point}>
            <InlineCode text={point} />
          </li>
        ))}
      </ul>
      <DecisionLineage
        supersedes={row.supersedes}
        supersededBy={row.supersededBy}
        labels={{
          supersedes: copy.supersedes,
          supersededBy: copy.supersededBy,
        }}
      />
      <p className="adr-row-meta">
        <StatusBadge status={row.status} label={row.statusLabel} />
        <time dateTime={row.date}>{row.dateLabel}</time>
        <span className="adr-row-area">{row.area}</span>
      </p>
      <Link href={row.href} className="adr-detail-open">
        {copy.open}
      </Link>
    </article>
  );
}
