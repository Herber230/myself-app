import type { ArchitectureDecision } from '../../entities/architecture-decision.entity.js';
import type { Project } from '../../entities/project.entity.js';
import type { ProjectPath } from '../../entities/project-path.entity.js';
import type { ProjectPattern } from '../../entities/project-pattern.entity.js';
import type { Technology } from '../../entities/technology.entity.js';

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
}
