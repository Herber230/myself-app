/**
 * What the decision explorer shows of each record and offers to filter by,
 * translated at build (#77).
 */
import {
  type ArchitectureDecision,
  DECISION_STATUSES,
} from '@myself-app/domain';
import { decisionNumber } from '@myself-app/domain/use-cases';

import type { siteT } from '../../i18n/server.js';
import { formatDay } from '../../molecules/post-card/post-cards.js';
import { decisionPath } from '../../routing/project-paths.js';
import type { SiteLocale } from '../../routing/site-locales.js';
import type { DecisionExplorerCopy, DecisionRow } from './decision-explorer.js';

type T = ReturnType<typeof siteT>;

export function decisionRowsOf(
  decisions: readonly ArchitectureDecision[],
  locale: SiteLocale,
  t: T,
): DecisionRow[] {
  return decisions.map(decision => {
    // Validation has made every date and area present.
    const date = decision.date as Date;
    const number = decisionNumber(decision);
    return {
      id: String(decision.id),
      number,
      title: decision.title,
      status: decision.status,
      statusLabel: t(`projectPage.status.${decision.status}`),
      date: date.toISOString(),
      dateLabel: formatDay(date, locale),
      area: decision.area as string,
      ...(decision.readWhen && { readWhen: decision.readWhen }),
      href: decisionPath(locale, String(decision.project.id), number),
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
    clear: t('projectPage.filter.clear'),
    showing: t('projectPage.filter.showing'),
    empty: t('projectPage.filter.empty'),
    sort: t('projectPage.filter.sort'),
    ascending: t('projectPage.filter.ascending'),
    descending: t('projectPage.filter.descending'),
    readWhen: t('projectPage.readWhen'),
    sortFields: {
      number: t('projectPage.sort.number'),
      date: t('projectPage.sort.date'),
      title: t('projectPage.sort.title'),
      status: t('projectPage.sort.status'),
    },
  };
}
