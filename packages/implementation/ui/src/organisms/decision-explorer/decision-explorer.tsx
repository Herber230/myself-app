'use client';

/**
 * A project's decision records with their filter and sort (#77): the one
 * client part of a project's page.
 *
 * The filter and the sort are the query string, read once hydrated, and
 * answered by entifix's `load` use case over `/data/adr.json`. The rows are
 * the build's, kept and ordered by the answer. The static HTML lists every
 * record by number, which is also what a visitor without scripting gets.
 */
import { ArchitectureDecision } from '@myself-app/domain/entities/architecture-decision';
import { useUrlFilter } from '@myself-app/entifix-incubator-browser/react';
import {
  FilterFieldset,
  FilterSummary,
  SortControl,
  ToggleGroup,
} from '@myself-app/entifix-incubator-react-controls';
import Link from 'next/link';
import { useMemo } from 'react';

import { StatusBadge } from '../../atoms/status-badge/status-badge.js';
import { useSources } from '../../sources/sources.js';
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
  readonly area: string;
  readonly readWhen?: string;
  readonly href: string;
}

/** Every string the controls show, translated at build. */
export interface DecisionExplorerCopy {
  readonly label: string;
  readonly status: string;
  readonly area: string;
  readonly search: string;
  readonly clear: string;
  /** `{{shown}}` and `{{total}}` are replaced. */
  readonly showing: string;
  readonly empty: string;
  readonly sort: string;
  readonly ascending: string;
  readonly descending: string;
  readonly readWhen: string;
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
      }),
    [statuses, areas],
  );
  const sources = useSources();
  const { filter, filtering, order, toggle, set, clear } = useUrlFilter<
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

  return (
    <div className="adr-explorer">
      {filter !== null && (
        <FilterFieldset label={copy.label}>
          <FilterSummary
            searchLabel={copy.search}
            search={filter.q[0] ?? ''}
            onSearch={text => set('q', [text])}
            showing={copy.showing
              .replace('{{shown}}', String(shown.length))
              .replace('{{total}}', String(decisions.length))}
            clearLabel={copy.clear}
            onClear={filtering ? clear : undefined}
          />
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
        </FilterFieldset>
      )}
      {shown.length === 0 ? (
        <p className="adr-empty">{copy.empty}</p>
      ) : (
        <ol className="adr-list">
          {shown.map(row => (
            <li key={row.id} className="adr-row" data-adr={row.id}>
              <div className="adr-row-head">
                <span className="adr-row-number">{row.number}</span>
                <h3 className="adr-row-title">
                  <Link href={row.href}>{row.title}</Link>
                </h3>
                <StatusBadge status={row.status} label={row.statusLabel} />
              </div>
              {row.readWhen && (
                <p className="adr-row-read-when">
                  <span className="adr-row-read-when-label">
                    {copy.readWhen}
                  </span>
                  <span>{row.readWhen}</span>
                </p>
              )}
              <p className="adr-row-meta">
                <time dateTime={row.date}>{row.dateLabel}</time>
                <span className="adr-row-area">{row.area}</span>
              </p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
