import type { ArchitectureDecision } from '../../entities/architecture-decision.entity.js';
import type { Project } from '../../entities/project.entity.js';

/** One decision record's page (#77). */
export interface DecisionPage {
  readonly decision: ArchitectureDecision;
  readonly project: Project;
  /** The records it replaces, by number. */
  readonly supersedes: readonly ArchitectureDecision[];
  /** The records that replace it, by number. */
  readonly supersededBy: readonly ArchitectureDecision[];
}

/** A decision record's route: its project, and its number as written. */
export interface DecisionRoute {
  readonly project: string;
  /** Four digits, as the record's file names it: `0016`. */
  readonly number: string;
}
