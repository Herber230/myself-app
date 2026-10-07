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
 * One request followed through a project's hexagon (ADR 0022), a step at a
 * time: its steps are `ScenarioStep`s. Offered in `order`.
 */
@entity({ key: 'architecture-scenario', domain: 'engineering' })
export class ArchitectureScenario implements Entity {
  #id?: EntityId;
  #label?: LocalizedText;
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
  get label(): LocalizedText | undefined {
    return this.#label;
  }
  set label(value: LocalizedText | undefined) {
    this.#label = value;
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
