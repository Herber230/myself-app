import type { ArchitectureDecision } from '../../entities/architecture-decision.entity.js';
import type { ArchitectureNode } from '../../entities/architecture-node.entity.js';
import type { ArchitectureRuntime } from '../../entities/architecture-runtime.entity.js';
import type { ArchitectureScenario } from '../../entities/architecture-scenario.entity.js';
import type { LayerPackage } from '../../entities/layer-package.entity.js';
import type { PackageLayer } from '../../entities/package-layer.entity.js';
import type { Project } from '../../entities/project.entity.js';
import type { ProjectPath } from '../../entities/project-path.entity.js';
import type { ProjectPattern } from '../../entities/project-pattern.entity.js';
import type { RefusedImport } from '../../entities/refused-import.entity.js';
import type { ScenarioStep } from '../../entities/scenario-step.entity.js';
import type { Technology } from '../../entities/technology.entity.js';

/** A project's hexagon and its scenarios (ADR 0022). */
export interface ProjectArchitecture {
  /** In their own order. */
  readonly runtimes: readonly ArchitectureRuntime[];
  /** Each with `connects` and `runtime` resolved. */
  readonly nodes: readonly ArchitectureNode[];
  /** In their own order, each with its steps in theirs, links resolved. */
  readonly scenarios: readonly {
    readonly scenario: ArchitectureScenario;
    readonly steps: readonly ScenarioStep[];
  }[];
}

/** A project's packages in their layers (ADR 0022). */
export interface ProjectLayers {
  /** Top band first. */
  readonly layers: readonly PackageLayer[];
  /** Each with `folder` and `imports` resolved. */
  readonly packages: readonly LayerPackage[];
  readonly refused: readonly RefusedImport[];
}

/** Everything a project's page shows (#77). */
export interface ProjectPage {
  readonly project: Project;
  /** In the order the project lists them. */
  readonly technologies: readonly Technology[];
  /** In their own order. */
  readonly patterns: readonly ProjectPattern[];
  /** The file tree's rows, in their own order. */
  readonly paths: readonly ProjectPath[];
  /** Its decision records, by number: what the explorer starts from. */
  readonly decisions: readonly ArchitectureDecision[];
  /** Its hexagon, when it has one. */
  readonly architecture?: ProjectArchitecture;
  /** Its layers, when it has them; its file tree stands in otherwise. */
  readonly layers?: ProjectLayers;
}
