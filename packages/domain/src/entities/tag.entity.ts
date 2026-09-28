import { accessor, type Entity, entity, type EntityId } from '@entifix/core';

import type { LocalizedText } from '../localized-text.js';

/**
 * What a post is about — "testing", "static sites" — and what relates posts
 * to each other (ADR 0017). Its id is the value a blog link filters on
 * (`/blog/?tag=testing`).
 */
@entity({ key: 'tag', domain: 'blog' })
export class Tag implements Entity {
  #id?: EntityId;
  #label?: LocalizedText;

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
}
