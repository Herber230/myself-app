import { accessor, type Entity, entity, type EntityId } from '@entifix/core';

import type { LocalizedText } from '../localized-text.js';

/** A tag a technology carries — "server-side rendering", "monorepo". */
@entity({ key: 'technology-area', domain: 'radar' })
export class TechnologyArea implements Entity {
  #id?: EntityId;
  #name?: LocalizedText;
  #description?: LocalizedText;

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
  get description(): LocalizedText | undefined {
    return this.#description;
  }
  set description(value: LocalizedText | undefined) {
    this.#description = value;
  }
}
