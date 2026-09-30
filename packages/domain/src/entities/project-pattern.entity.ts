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
 * A pattern a project is built on (#77): what it is called, and a sentence on
 * how the project uses it. Its page lists them in `order`.
 */
@entity({ key: 'project-pattern', domain: 'engineering' })
export class ProjectPattern implements Entity {
  #id?: EntityId;
  #name?: LocalizedText;
  #summary?: LocalizedText;
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

  @accessor({
    type: 'string',
    required: true,
    filterable: false,
    sortable: false,
  })
  get summary(): LocalizedText | undefined {
    return this.#summary;
  }
  set summary(value: LocalizedText | undefined) {
    this.#summary = value;
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
