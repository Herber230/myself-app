import {
  Center,
  linkClassName,
  Stack,
  Text,
} from '@entifix/react-controls/primitives';
import type { ArchitectureDecision } from '@myself-app/domain';
import {
  decisionNumber,
  type DecisionPage,
} from '@myself-app/domain/use-cases';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { StatusBadge } from '../../atoms/status-badge/status-badge.js';
import { siteT } from '../../i18n/server.js';
import {
  DecisionLineage,
  type LineageLink,
} from '../../molecules/decision-lineage/decision-lineage.js';
import { formatDay } from '../../molecules/post-card/post-cards.js';
import { SiteNav } from '../../organisms/site-nav/site-nav.js';
import {
  decisionPath,
  DECISIONS_ANCHOR,
  projectPath,
} from '../../routing/project-paths.js';
import type { SiteLocale } from '../../routing/site-locales.js';

export interface DecisionPageData {
  readonly locale: SiteLocale;
  readonly page: DecisionPage;
  /** Its body, rendered from Markdown (`renderMarkdownBody`). */
  readonly body: ReactNode;
}

/**
 * One architecture decision record (#77): where it stands, when it was
 * decided, the symptom that should send a reader to it, what it replaces and
 * what replaces it, and the record itself — in English, as written (ADR 0020).
 */
export function DecisionPageView({ locale, page, body }: DecisionPageData) {
  const t = siteT(locale);
  const { decision, project, supersedes, supersededBy } = page;
  const projectId = String(project.id);
  const number = decisionNumber(decision);
  const linkTo = (each: ArchitectureDecision): LineageLink => ({
    id: String(each.id),
    label: `${t('decisionPage.number', { number: decisionNumber(each) })} · ${each.title}`,
    href: decisionPath(locale, projectId, decisionNumber(each)),
  });
  // Validation has made the date and the area present.
  const date = decision.date as Date;
  return (
    <>
      <SiteNav locale={locale} path={`/projects/${projectId}/adr/${number}`} />
      <Center as="main" gutters className="decision-page py-2xl">
        <Stack gap="l">
          <Link
            href={`${projectPath(locale, projectId)}#${DECISIONS_ANCHOR}`}
            className={linkClassName}
          >
            {t('decisionPage.back', { project: project.name })}
          </Link>
          <header className="decision-page-header">
            <Stack gap="s">
              <p className="decision-page-number">
                {t('decisionPage.number', { number })}
              </p>
              <Text as="h1" step={3} weight="semibold" lang="en">
                {decision.title}
              </Text>
              <dl className="decision-page-facts">
                <div>
                  <dt>{t('projectPage.sort.status')}</dt>
                  <dd>
                    <StatusBadge
                      status={decision.status}
                      label={t(`projectPage.status.${decision.status}`)}
                    />
                  </dd>
                </div>
                <div>
                  <dt>{t('decisionPage.date')}</dt>
                  <dd>
                    <time dateTime={date.toISOString()}>
                      {formatDay(date, locale)}
                    </time>
                  </dd>
                </div>
                <div>
                  <dt>{t('decisionPage.area')}</dt>
                  <dd>{decision.area}</dd>
                </div>
              </dl>
              {decision.readWhen && (
                <p className="adr-row-read-when decision-page-read-when">
                  <span className="adr-row-read-when-label">
                    {t('projectPage.readWhen')}
                  </span>
                  <span lang="en">{decision.readWhen}</span>
                </p>
              )}
              <DecisionLineage
                supersedes={supersedes.map(linkTo)}
                supersededBy={supersededBy.map(linkTo)}
                labels={{
                  supersedes: t('decisionPage.supersedes'),
                  supersededBy: t('decisionPage.supersededBy'),
                }}
              />
            </Stack>
          </header>
          <p className="adr-language-note">{t('projectPage.englishOnly')}</p>
          <article lang="en" className="decision-page-body">
            {body}
          </article>
        </Stack>
      </Center>
    </>
  );
}
