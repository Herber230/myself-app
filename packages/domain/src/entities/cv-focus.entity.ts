import { accessor, type Entity, entity, type EntityId } from '@entifix/core';

import type { LocalizedText } from '../localized-text.js';

/**
 * A kind of work a CV can lead with — backend, frontend, devops. A variant
 * takes some, and each highlight of an employment is tagged with the ones it
 * speaks to, so one role reads differently in each variant (ADR 0012).
 *
 * An entity rather than an enum value, because a link collection is validated
 * (every id exists) and a scalar collection is not.
 */
@entity({ key: 'cv-focus', domain: 'cv' })
export class CvFocus implements Entity {
  #id?: EntityId;
  #name?: LocalizedText;
  #order = 0;

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
}
