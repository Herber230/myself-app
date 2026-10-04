/**
 * What the decision explorer shows of each record and offers to filter by,
 * translated at build (#77).
 */
import {
  type ArchitectureDecision,
  DECISION_STATUSES,
} from '@myself-app/domain';
import { decisionNumber } from '@myself-app/domain/use-cases';
import { targetsOf } from '@myself-app/entifix-incubator-static-adapter';

import type { siteT } from '../../i18n/server.js';
import { formatDay } from '../../molecules/post-card/post-cards.js';
import { decisionPath } from '../../routing/project-paths.js';
import type { SiteLocale } from '../../routing/site-locales.js';
import type { DecisionExplorerCopy, DecisionRow } from './decision-explorer.js';

type T = ReturnType<typeof siteT>;

/** A day, short, as a timeline's tick names it: `Sep 17`. */
export function shortDay(date: Date, locale: SiteLocale): string {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })
    .format(date)
    .replace('.', '');
}

/**
 * The project's records as rows, each with what it supersedes (resolved by
 * `loadProjectPage`) and what supersedes it: the other side of the same
 * links, among the same records.
 */
export function decisionRowsOf(
  decisions: readonly ArchitectureDecision[],
  locale: SiteLocale,
  t: T,
): DecisionRow[] {
  const linkTo = (decision: ArchitectureDecision) => {
    const number = decisionNumber(decision);
    return {
      id: String(decision.id),
      label: t('decisionPage.number', { number }) + ` · ${decision.title}`,
      href: decisionPath(locale, String(decision.project.id), number),
    };
  };
  const supersededBy = new Map<string, ArchitectureDecision[]>();
  for (const decision of decisions) {
    for (const target of targetsOf(decision.supersedes)) {
      const id = String(target.id);
      supersededBy.set(id, [...(supersededBy.get(id) ?? []), decision]);
    }
  }
  return decisions.map(decision => {
    // Validation has made every date, area and summary present.
    const date = decision.date as Date;
    const { href } = linkTo(decision);
    const id = String(decision.id);
    return {
      id,
      number: decisionNumber(decision),
      title: decision.title,
      status: decision.status,
      statusLabel: t(`projectPage.status.${decision.status}`),
      date: date.toISOString(),
      dateLabel: formatDay(date, locale),
      dayLabel: shortDay(date, locale),
      area: decision.area as string,
      ...(decision.readWhen && { readWhen: decision.readWhen }),
      points: (decision.summary as string).split('\n'),
      supersedes: targetsOf(decision.supersedes).map(linkTo),
      supersededBy: (supersededBy.get(id) ?? []).map(linkTo),
      href,
    };
  });
}

/** The statuses and areas the records have, as the filter offers them. */
export function decisionOptionsOf(
  decisions: readonly ArchitectureDecision[],
  t: T,
) {
  const present = new Set(decisions.map(decision => decision.status));
  return {
    statuses: DECISION_STATUSES.filter(status => present.has(status)).map(
      status => ({ key: status, name: t(`projectPage.status.${status}`) }),
    ),
    areas: [...new Set(decisions.map(decision => decision.area as string))]
      .sort()
      .map(area => ({ key: area, name: area })),
  };
}

export function decisionExplorerCopyOf(t: T): DecisionExplorerCopy {
  return {
    label: t('projectPage.filter.label'),
    status: t('projectPage.filter.status'),
    area: t('projectPage.filter.area'),
    search: t('projectPage.filter.search'),
    placeholder: t('projectPage.filter.placeholder'),
    active: t('projectPage.filter.active', { n: '{{n}}' }),
    remove: t('projectPage.filter.remove', { name: '{{name}}' }),
    clear: t('projectPage.filter.clear'),
    showing: t('projectPage.filter.showing'),
    empty: t('projectPage.filter.empty'),
    sort: t('projectPage.filter.sort'),
    ascending: t('projectPage.filter.ascending'),
    descending: t('projectPage.filter.descending'),
    readWhen: t('projectPage.readWhen'),
    timeline: t('projectPage.timeline'),
    points: t('projectPage.points'),
    open: t('projectPage.open'),
    supersedes: t('decisionPage.supersedes'),
    supersededBy: t('decisionPage.supersededBy'),
    sortFields: {
      number: t('projectPage.sort.number'),
      date: t('projectPage.sort.date'),
      title: t('projectPage.sort.title'),
      status: t('projectPage.sort.status'),
    },
  };
}
