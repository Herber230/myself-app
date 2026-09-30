import {
  type StaticContent,
  targetOf,
  targetsOf,
} from '@myself-app/entifix-incubator-static-adapter';

import { ArchitectureDecision } from '../../entities/architecture-decision.entity.js';
import type {
  DecisionPage,
  DecisionRoute,
} from './load-architecture-decision.types.js';

const BY_NUMBER = [{ 0: { property: 'number', type: 'asc' } }] as const;

/** A record's number as its route and file write it: four digits. */
export function decisionNumber(decision: ArchitectureDecision): string {
  return String(decision.number).padStart(4, '0');
}

/** Every decision record's route, project by project, by number. */
export async function loadDecisionRoutes(
  content: StaticContent,
): Promise<DecisionRoute[]> {
  const decisions = await content.loadAll(ArchitectureDecision, {
    sorting: [...BY_NUMBER],
  });
  return decisions.map(decision => ({
    project: String(decision.project.id),
    number: decisionNumber(decision),
  }));
}

/**
 * A decision record (#77), with its project, what it supersedes, and what
 * supersedes it — the other side of `supersedes`, found by filtering on it.
 * Nothing for a route that names no record.
 */
export async function loadArchitectureDecision(
  content: StaticContent,
  { project, number }: DecisionRoute,
): Promise<DecisionPage | undefined> {
  const id = `${project}-${number}`;
  const [[decision], supersededBy] = await Promise.all([
    content.loadAll(
      ArchitectureDecision,
      { filtering: [{ property: 'id', operator: 'eq', value: id }] },
      { resolve: ['project', 'supersedes'] },
    ),
    // `in` over a collection matches any of its ids, as Mongo's does.
    content.loadAll(ArchitectureDecision, {
      filtering: [{ property: 'supersedes', operator: 'in', values: [id] }],
      sorting: [...BY_NUMBER],
    }),
  ]);
  if (decision === undefined) return undefined;
  return {
    decision,
    project: targetOf(decision.project),
    supersedes: [...targetsOf(decision.supersedes)].sort(
      (a, b) => a.number - b.number,
    ),
    supersededBy,
  };
}
