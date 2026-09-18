import { accessor, type Entity, entity, type EntityId } from '@entifix/core';

import type { LocalizedText } from '../localized-text.js';

/** One of the four sectors the radar is divided into — techniques, tools, platforms, languages and frameworks. `order` is the index the chart draws it at. */
@entity({ key: 'quadrant', domain: 'radar' })
export class Quadrant implements Entity {
  #id?: EntityId;
  #order = 0;
  #name?: LocalizedText;
  #description?: LocalizedText;

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
  get description(): LocalizedText | undefined {
    return this.#description;
  }
  set description(value: LocalizedText | undefined) {
    this.#description = value;
  }
}
