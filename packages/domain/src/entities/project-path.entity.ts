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
 * One row of a project's annotated file tree (#77): a path in its repository,
 * relative to the root, and what lives there. A folder's path ends in `/`.
 * The tree is written by hand rather than listed from the repository, so each
 * row says why the path exists; this repository's rows are checked to exist.
 */
@entity({ key: 'project-path', domain: 'engineering' })
export class ProjectPath implements Entity {
  #id?: EntityId;
  #path = '';
  #note?: LocalizedText;
  #order = 0;
  #project = new EntityLink(Project);

  @accessor({ type: 'id' })
  get id(): EntityId {
    return this.#id;
  }
  set id(value: EntityId) {
    this.#id = value;
  }

  @accessor({ type: 'string', required: true, sortable: true })
  get path(): string {
    return this.#path;
  }
  set path(value: string) {
    this.#path = value;
  }

  @accessor({
    type: 'string',
    required: true,
    filterable: false,
    sortable: false,
  })
  get note(): LocalizedText | undefined {
    return this.#note;
  }
  set note(value: LocalizedText | undefined) {
    this.#note = value;
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
