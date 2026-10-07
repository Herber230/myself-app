/** The release decision's own words, translated at build (ADR 0023). */
import type { siteT } from '../../i18n/server.js';
import type { ReleaseDecisionCopy } from './release-decision.js';

type T = ReturnType<typeof siteT>;

export function releaseCopyOf(t: T): ReleaseDecisionCopy {
  return {
    title: t('projectPage.release.title'),
    lead: t('projectPage.release.lead'),
    type: t('projectPage.release.type'),
    breaking: t('projectPage.release.breaking'),
    description: t('projectPage.release.description'),
    example: t('projectPage.release.example'),
    commit: t('projectPage.release.commit'),
    next: t('projectPage.release.next'),
    bump: t('projectPage.release.bump', {
      from: '{{from}}',
      to: '{{to}}',
      level: '{{level}}',
    }),
    levels: {
      major: t('projectPage.release.levels.major'),
      minor: t('projectPage.release.levels.minor'),
      patch: t('projectPage.release.levels.patch'),
    },
    none: t('projectPage.release.none'),
    deploys: t('projectPage.release.deploys'),
    yes: t('projectPage.release.yes'),
    no: t('projectPage.release.no'),
    changelog: t('projectPage.release.changelog'),
    hidden: t('projectPage.release.hidden'),
  };
}
