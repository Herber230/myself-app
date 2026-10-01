import {
  accessor,
  type Entity,
  entity,
  EntityCollectionLink,
  type EntityId,
} from '@entifix/core';

import type { LocalizedText } from '../localized-text.js';
import { Post } from './post.entity.js';

/**
 * Something I care about away from the keyboard — motorcycles, reading,
 * salsa — shown as a section of the "Beyond the code" page and a line of the
 * landing page's teaser. Part of the profile, like a project. Its glyph is
 * the UI's, keyed by its id.
 */
@entity({ key: 'interest', domain: 'profile' })
export class Interest implements Entity {
  #id?: EntityId;
  #name?: LocalizedText;
  #summary?: LocalizedText;
  #body?: LocalizedText;
  #posts = new EntityCollectionLink(Post);
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

  /** One sentence: the teaser's line, and the section's lead. */
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

  /**
   * What its section says: Markdown per locale, read from
   * `interests/<id>.<locale>.md` like a project's overview, and optional for
   * the same reason — the browser's copy leaves it out.
   */
  @accessor({ type: 'string', filterable: false, sortable: false })
  get body(): LocalizedText | undefined {
    return this.#body;
  }
  set body(value: LocalizedText | undefined) {
    this.#body = value;
  }

  /** Posts of the blog that grew out of it, in the order it lists them. */
  @accessor({ type: 'linkCollection' })
  get posts(): EntityCollectionLink<Post> {
    return this.#posts;
  }

  @accessor({ type: 'number', required: true, sortable: true })
  get order(): number {
    return this.#order;
  }
  set order(value: number) {
    this.#order = value;
  }
}
