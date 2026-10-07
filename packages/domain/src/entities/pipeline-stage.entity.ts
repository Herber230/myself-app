import {
  accessor,
  type Entity,
  entity,
  type EntityId,
  EntityLink,
} from '@entifix/core';

import type { LocalizedText } from '../localized-text.js';
import { Project } from './project.entity.js';

/**
 * A column of a project's delivery pipeline (ADR 0023): on the machine, in the
 * pull request's check, at the gate, at the merge, at the deploy. Drawn left
 * to right in `order`.
 */
@entity({ key: 'pipeline-stage', domain: 'engineering' })
export class PipelineStage implements Entity {
  #id?: EntityId;
  #name?: LocalizedText;
  #order = 0;
  #project = new EntityLink(Project);

  @accessor({ type: 'id' })
  get id(): EntityId {
    return this.#id;
  }
  set id(value: EntityId) {
    this.#id = value;
  }

  @accessor({
    type: 'string',
    required: true,
    filterable: false,
    sortable: false,
  })
  get name(): LocalizedText | undefined {
    return this.#name;
  }
  set name(value: LocalizedText | undefined) {
    this.#name = value;
  }

  @accessor({ type: 'number', required: true, sortable: true })
  get order(): number {
    return this.#order;
  }
  set order(value: number) {
    this.#order = value;
  }

  @accessor({ type: 'link', required: true })
  get project(): EntityLink<Project> {
    return this.#project;
  }
}
