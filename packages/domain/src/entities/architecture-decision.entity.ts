import {
  accessor,
  type Entity,
  entity,
  EntityCollectionLink,
  type EntityId,
  EntityLink,
} from '@entifix/core';

import { Project } from './project.entity.js';

/**
 * Where a decision stands. `superseded-in-part` is a decision some of whose
 * reasoning a later one replaced, and the rest of which still holds.
 */
export const DECISION_STATUSES = [
  'proposed',
  'accepted',
  'superseded-in-part',
  'superseded',
] as const;

export type DecisionStatus = (typeof DECISION_STATUSES)[number];

/**
 * One architecture decision record of a project (#77), copied from its
 * repository's `docs/adr` by `tools/sync-adrs.mjs`. Its id is
 * `<project>-<number>`: `myself-app-0016`.
 *
 * Records are written in English only, so no member is localized: the page
 * around them is translated, the record is not (ADR 0020). `body` is the
 * record's Markdown without its header lines, read from `adrs/<id>.md`, and
 * optional here for the same reason as `Post.body`: the browser's copy leaves
 * it out.
 *
 * `supersedes` names the records this one replaces, in whole or in part. What
 * supersedes a record is the other side of the same link, found by a filter.
 */
@entity({ key: 'adr', domain: 'engineering' })
export class ArchitectureDecision implements Entity {
  #id?: EntityId;
  #number = 0;
  #title = '';
  #status: DecisionStatus = 'accepted';
  #date?: Date;
  #area?: string;
  #readWhen?: string;
  #body?: string;
  #project = new EntityLink(Project);
  #supersedes = new EntityCollectionLink(ArchitectureDecision);

  @accessor({ type: 'id' })
  get id(): EntityId {
    return this.#id;
  }
  set id(value: EntityId) {
    this.#id = value;
  }

  @accessor({
    type: 'number',
    required: true,
    filterable: true,
    sortable: true,
  })
  get number(): number {
    return this.#number;
  }
  set number(value: number) {
    this.#number = value;
  }

  @accessor({
    type: 'string',
    required: true,
    filterable: true,
    sortable: true,
  })
  get title(): string {
    return this.#title;
  }
  set title(value: string) {
    this.#title = value;
  }

  @accessor({
    type: 'enum',
    enumValues: DECISION_STATUSES,
    required: true,
    filterable: true,
    sortable: true,
  })
  get status(): DecisionStatus {
    return this.#status;
  }
  set status(value: DecisionStatus) {
    this.#status = value;
  }

  @accessor({
    type: 'date',
    required: true,
    filterable: true,
    sortable: true,
  })
  get date(): Date | undefined {
    return this.#date;
  }
  set date(value: Date | undefined) {
    this.#date = value;
  }

  /** The part of the project it decides: `platform`, `ui`, `hosting`… */
  @accessor({ type: 'string', required: true, filterable: true })
  get area(): string | undefined {
    return this.#area;
  }
  set area(value: string | undefined) {
    this.#area = value;
  }

  /** The symptom that should send a reader to it, human or agent. */
  @accessor({ type: 'string', filterable: true })
  get readWhen(): string | undefined {
    return this.#readWhen;
  }
  set readWhen(value: string | undefined) {
    this.#readWhen = value;
  }

  @accessor({ type: 'string' })
  get body(): string | undefined {
    return this.#body;
  }
  set body(value: string | undefined) {
    this.#body = value;
  }

  @accessor({ type: 'link', required: true })
  get project(): EntityLink<Project> {
    return this.#project;
  }

  @accessor({ type: 'linkCollection' })
  get supersedes(): EntityCollectionLink<ArchitectureDecision> {
    return this.#supersedes;
  }
}
