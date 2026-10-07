import { type StaticContent } from '@myself-app/entifix-incubator-static-adapter';

import { PipelineJob } from '../../entities/pipeline-job.entity.js';
import { PipelineScenario } from '../../entities/pipeline-scenario.entity.js';
import { PipelineStage } from '../../entities/pipeline-stage.entity.js';
import { PipelineStep } from '../../entities/pipeline-step.entity.js';
import type { ProjectPipeline } from './load-project-page.types.js';

const BY_ORDER = [{ 0: { property: 'order', type: 'asc' } }] as const;

/**
 * A project's delivery pipeline (ADR 0023): its stages left to right, their
 * jobs in order with what each needs and the records that decided it, and
 * its scenarios, each with its steps in order and the jobs each lights and
 * skips. Nothing for a project with no stages.
 */
export async function loadProjectPipeline(
  content: StaticContent,
  id: string,
): Promise<ProjectPipeline | undefined> {
  const ofProject = { property: 'project', operator: 'eq', value: id } as const;
  const [stages, scenarios] = await Promise.all([
    content.loadAll(PipelineStage, {
      filtering: [ofProject],
      sorting: [...BY_ORDER],
    }),
    content.loadAll(PipelineScenario, {
      filtering: [ofProject],
      sorting: [...BY_ORDER],
    }),
  ]);
  if (stages.length === 0) return undefined;
  const [jobs, steps] = await Promise.all([
    content.loadAll(
      PipelineJob,
      {
        filtering: [
          {
            property: 'stage',
            operator: 'in',
            values: stages.map(stage => String(stage.id)),
          },
        ],
        sorting: [...BY_ORDER],
      },
      { resolve: ['needs', 'decisions'] },
    ),
    scenarios.length === 0
      ? Promise.resolve([])
      : content.loadAll(
          PipelineStep,
          {
            filtering: [
              {
                property: 'scenario',
                operator: 'in',
                values: scenarios.map(scenario => String(scenario.id)),
              },
            ],
            sorting: [...BY_ORDER],
          },
          { resolve: ['jobs', 'skips'] },
        ),
  ]);
  return {
    stages,
    jobs,
    scenarios: scenarios.map(scenario => ({
      scenario,
      steps: steps.filter(step => step.scenario.id === scenario.id),
    })),
  };
}
