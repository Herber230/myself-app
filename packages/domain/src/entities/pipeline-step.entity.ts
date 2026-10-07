import {
  accessor,
  type Entity,
  entity,
  EntityCollectionLink,
  type EntityId,
  EntityLink,
} from '@entifix/core';

import type { LocalizedText } from '../localized-text.js';
import { PipelineJob } from './pipeline-job.entity.js';
import { PipelineScenario } from './pipeline-scenario.entity.js';

/**
 * A step of a pipeline scenario (ADR 0023): the jobs it lights, the jobs it
 * skips, what happens and the command or message that does it. `fails` marks
 * the step where the change is stopped.
 */
@entity({ key: 'pipeline-step', domain: 'engineering' })
export class PipelineStep implements Entity {
  #id?: EntityId;
  #order = 0;
  #title?: LocalizedText;
  #text?: LocalizedText;
  #code?: string;
  #fails = false;
  #scenario = new EntityLink(PipelineScenario);
  #jobs = new EntityCollectionLink(PipelineJob);
  #skips = new EntityCollectionLink(PipelineJob);

  @accessor({ type: 'id' })
  get id(): EntityId {
    return this.#id;
  }
  set id(value: EntityId) {
    this.#id = value;
  }

  @accessor({ type: 'number', required: true, sortable: true })
  get order(): number {
    return this.#order;
  }
  set order(value: number) {
    this.#order = value;
  }

  @accessor({
    type: 'string',
    required: true,
    filterable: false,
    sortable: false,
  })
  get title(): LocalizedText | undefined {
    return this.#title;
  }
  set title(value: LocalizedText | undefined) {
    this.#title = value;
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

  /** One line, as written: never translated. */
  @accessor({ type: 'string' })
  get code(): string | undefined {
    return this.#code;
  }
  set code(value: string | undefined) {
    this.#code = value;
  }

  @accessor({ type: 'boolean' })
  get fails(): boolean {
    return this.#fails;
  }
  set fails(value: boolean) {
    this.#fails = value;
  }

  @accessor({ type: 'link', required: true })
  get scenario(): EntityLink<PipelineScenario> {
    return this.#scenario;
  }

  @accessor({ type: 'linkCollection', required: true })
  get jobs(): EntityCollectionLink<PipelineJob> {
    return this.#jobs;
  }

  /** Jobs that do not run at this step. */
  @accessor({ type: 'linkCollection' })
  get skips(): EntityCollectionLink<PipelineJob> {
    return this.#skips;
  }
}
