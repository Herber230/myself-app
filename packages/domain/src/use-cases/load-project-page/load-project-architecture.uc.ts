import { type StaticContent } from '@myself-app/entifix-incubator-static-adapter';

import { ArchitectureNode } from '../../entities/architecture-node.entity.js';
import { ArchitectureRuntime } from '../../entities/architecture-runtime.entity.js';
import { ArchitectureScenario } from '../../entities/architecture-scenario.entity.js';
import { LayerPackage } from '../../entities/layer-package.entity.js';
import { PackageLayer } from '../../entities/package-layer.entity.js';
import { RefusedImport } from '../../entities/refused-import.entity.js';
import { ScenarioStep } from '../../entities/scenario-step.entity.js';
import type {
  ProjectArchitecture,
  ProjectLayers,
} from './load-project-page.types.js';

const BY_ORDER = [{ 0: { property: 'order', type: 'asc' } }] as const;

function ofProject(id: string) {
  return { property: 'project', operator: 'eq', value: id } as const;
}

/**
 * A project's hexagon (ADR 0022): its runtimes and its parts, each part's
 * lines and runtime resolved, and its scenarios in order, each with its steps
 * in order and every part a step names resolved. Nothing for a project with
 * no parts.
 */
export async function loadProjectArchitecture(
  content: StaticContent,
  id: string,
): Promise<ProjectArchitecture | undefined> {
  const [runtimes, nodes, scenarios] = await Promise.all([
    content.loadAll(ArchitectureRuntime, {
      filtering: [ofProject(id)],
      sorting: [...BY_ORDER],
    }),
    content.loadAll(
      ArchitectureNode,
      { filtering: [ofProject(id)] },
      { resolve: ['connects', 'runtime'] },
    ),
    content.loadAll(ArchitectureScenario, {
      filtering: [ofProject(id)],
      sorting: [...BY_ORDER],
    }),
  ]);
  if (nodes.length === 0) return undefined;
  const steps =
    scenarios.length === 0
      ? []
      : await content.loadAll(
          ScenarioStep,
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
          { resolve: ['nodes', 'from', 'to', 'runtime'] },
        );
  return {
    runtimes,
    nodes,
    scenarios: scenarios.map(scenario => ({
      scenario,
      steps: steps.filter(step => step.scenario.id === scenario.id),
    })),
  };
}

/**
 * A project's dependency layers (ADR 0022): its bands top to bottom, their
 * packages with folder and imports resolved, and the imports lint refuses.
 * Nothing for a project with no bands.
 */
export async function loadProjectLayers(
  content: StaticContent,
  id: string,
): Promise<ProjectLayers | undefined> {
  const layers = await content.loadAll(PackageLayer, {
    filtering: [ofProject(id)],
    sorting: [...BY_ORDER],
  });
  if (layers.length === 0) return undefined;
  const packages = await content.loadAll(
    LayerPackage,
    {
      filtering: [
        {
          property: 'layer',
          operator: 'in',
          values: layers.map(layer => String(layer.id)),
        },
      ],
    },
    { resolve: ['folder', 'imports'] },
  );
  const refused = await content.loadAll(RefusedImport, {
    filtering: [
      {
        property: 'from',
        operator: 'in',
        values: packages.map(each => String(each.id)),
      },
    ],
  });
  return { layers, packages, refused };
}
