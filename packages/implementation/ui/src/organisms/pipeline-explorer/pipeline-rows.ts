/**
 * What the pipeline explorer shows of a project's delivery pipeline,
 * translated at build (ADR 0023).
 */
import { localize, type LocalizedText } from '@myself-app/domain';
import {
  decisionNumber,
  type ProjectPipeline,
} from '@myself-app/domain/use-cases';
import { targetsOf } from '@myself-app/entifix-incubator-static-adapter';

import type { siteT } from '../../i18n/server.js';
import { decisionPath } from '../../routing/project-paths.js';
import type { SiteLocale } from '../../routing/site-locales.js';
import type {
  PipelineExplorerCopy,
  PipelineView,
} from './pipeline-explorer.js';

type T = ReturnType<typeof siteT>;

/**
 * The pipeline as the explorer draws it: its stages, each job with its text,
 * its file (read on `main` when `repositoryUrl` is given) and its records,
 * one arrow per wait, and the scenarios with their steps.
 */
export function pipelineViewOf(
  pipeline: ProjectPipeline,
  {
    locale,
    projectId,
    repositoryUrl,
    t,
  }: {
    locale: SiteLocale;
    projectId: string;
    repositoryUrl?: string;
    t: T;
  },
): PipelineView {
  const text = (value: LocalizedText | undefined) =>
    localize(value as LocalizedText, locale);
  const ids = (links: Parameters<typeof targetsOf>[0]) =>
    targetsOf(links).map(each => String(each.id));
  return {
    stages: pipeline.stages.map(stage => ({
      id: String(stage.id),
      label: text(stage.name),
    })),
    jobs: pipeline.jobs.map(job => ({
      id: String(job.id),
      label: job.label,
      stage: String(job.stage.id),
      text: text(job.text),
      ...(job.workflow && {
        workflow: job.workflow,
        ...(repositoryUrl && {
          workflowUrl: `${repositoryUrl}/blob/main/${job.workflow}`,
        }),
      }),
      decisions: targetsOf(job.decisions).map(decision => {
        const number = decisionNumber(decision);
        return {
          label: t('projectPage.decisionLink', { number }),
          href: decisionPath(locale, projectId, number),
        };
      }),
    })),
    needs: pipeline.jobs.flatMap(job =>
      ids(job.needs).map(from => ({ from, to: String(job.id) })),
    ),
    scenarios: pipeline.scenarios.map(({ scenario, steps }) => ({
      id: String(scenario.id),
      label: text(scenario.label),
      steps: steps.map(step => ({
        jobs: ids(step.jobs),
        skips: ids(step.skips),
        title: text(step.title),
        text: text(step.text),
        ...(step.code && { code: step.code }),
        fails: step.fails,
      })),
    })),
  };
}

/** The explorer's own words. */
export function pipelineCopyOf(t: T): PipelineExplorerCopy {
  return {
    label: t('projectPage.pipeline.label'),
    scenario: t('projectPage.hexagon.scenario'),
    free: t('projectPage.hexagon.free'),
    hint: t('projectPage.pipeline.hint'),
    definedIn: t('projectPage.pipeline.definedIn'),
    decidedIn: t('projectPage.pipeline.decidedIn'),
    player: {
      // `count` is i18next's plural option: the catalog says `total`.
      step: t('projectPage.hexagon.step', { n: '{{n}}', total: '{{count}}' }),
      previous: t('projectPage.hexagon.previous'),
      next: t('projectPage.hexagon.next'),
      play: t('projectPage.hexagon.play'),
      pause: t('projectPage.hexagon.pause'),
      restart: t('projectPage.hexagon.restart'),
    },
  };
}
