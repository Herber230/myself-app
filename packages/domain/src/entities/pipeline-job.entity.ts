import {
  accessor,
  type Entity,
  entity,
  EntityCollectionLink,
  type EntityId,
  EntityLink,
} from '@entifix/core';

import type { LocalizedText } from '../localized-text.js';
import { ArchitectureDecision } from './architecture-decision.entity.js';
import { PipelineStage } from './pipeline-stage.entity.js';

/**
 * A job of a project's pipeline (ADR 0023): a git hook, a workflow's job or a
 * hand-run step. `workflow` is the file that defines it, relative to the
 * repository root, and `job` its key there; the conventions spec holds both,
 * and `needs` within one workflow, to the file. `needs` across files draws
 * the flow from one to the next.
 */
@entity({ key: 'pipeline-job', domain: 'engineering' })
export class PipelineJob implements Entity {
  #id?: EntityId;
  #label = '';
  #workflow?: string;
  #job?: string;
  #text?: LocalizedText;
  #order = 0;
  #stage = new EntityLink(PipelineStage);
  #needs = new EntityCollectionLink(PipelineJob);
  #decisions = new EntityCollectionLink(ArchitectureDecision);

  @accessor({ type: 'id' })
  get id(): EntityId {
    return this.#id;
  }
  set id(value: EntityId) {
    this.#id = value;
  }

  /** Its name as the workflow writes it, in every language. */
  @accessor({ type: 'string', required: true })
  get label(): string {
    return this.#label;
  }
  set label(value: string) {
    this.#label = value;
  }

  @accessor({ type: 'string' })
  get workflow(): string | undefined {
    return this.#workflow;
  }
  set workflow(value: string | undefined) {
    this.#workflow = value;
  }

  @accessor({ type: 'string' })
  get job(): string | undefined {
    return this.#job;
  }
  set job(value: string | undefined) {
    this.#job = value;
  }

  @accessor({
    type: 'string',
    required: true,
    filterable: false,
    sortable: false,
  })
  get text(): LocalizedText | undefined {
    return this.#text;
  }
  set text(value: LocalizedText | undefined) {
    this.#text = value;
  }

  @accessor({ type: 'number', required: true, sortable: true })
  get order(): number {
    return this.#order;
  }
  set order(value: number) {
    this.#order = value;
  }

  @accessor({ type: 'link', required: true })
  get stage(): EntityLink<PipelineStage> {
    return this.#stage;
  }

  /** The jobs that finish before it: one arrow each. */
  @accessor({ type: 'linkCollection' })
  get needs(): EntityCollectionLink<PipelineJob> {
    return this.#needs;
  }

  /** The records that decided it, if any. */
  @accessor({ type: 'linkCollection' })
  get decisions(): EntityCollectionLink<ArchitectureDecision> {
    return this.#decisions;
  }
}
