import {
  accessor,
  type Entity,
  entity,
  type EntityId,
  EntityLink,
} from '@entifix/core';

import type { LocalizedText } from '../localized-text.js';
import { Employer } from './employer.entity.js';

/** One stretch at one employer. `end` absent means it is the current one. */
@entity({ key: 'employment-period', domain: 'cv' })
export class EmploymentPeriod implements Entity {
  #id?: EntityId;
  #employer = new EntityLink(Employer);
  #role?: LocalizedText;
  #responsibilities?: LocalizedText;
  #start?: Date;
  #end?: Date;

  @accessor({ type: 'id' })
  get id(): EntityId {
    return this.#id;
  }
  set id(value: EntityId) {
    this.#id = value;
  }

  @accessor({ type: 'link' })
  get employer(): EntityLink<Employer> {
    return this.#employer;
  }

  @accessor({
    type: 'string',
    required: true,
    filterable: false,
    sortable: false,
  })
  get role(): LocalizedText | undefined {
    return this.#role;
  }
  set role(value: LocalizedText | undefined) {
    this.#role = value;
  }

  @accessor({
    type: 'string',
    required: true,
    filterable: false,
    sortable: false,
  })
  get responsibilities(): LocalizedText | undefined {
    return this.#responsibilities;
  }
  set responsibilities(value: LocalizedText | undefined) {
    this.#responsibilities = value;
  }

  @accessor({ type: 'date', required: true, sortable: true })
  get start(): Date | undefined {
    return this.#start;
  }
  set start(value: Date | undefined) {
    this.#start = value;
  }

  /** Absent while it is the current role. */
  @accessor({ type: 'date', sortable: true })
  get end(): Date | undefined {
    return this.#end;
  }
  set end(value: Date | undefined) {
    this.#end = value;
  }
}
