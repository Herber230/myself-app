import {
  accessor,
  type Entity,
  entity,
  EntityCollectionLink,
  type EntityId,
} from '@entifix/core';

import type { LocalizedText } from '../localized-text.js';
import { Tag } from './tag.entity.js';
import { Technology } from './technology.entity.js';

/**
 * One blog post (ADR 0017). Its id is its slug: `/[locale]/blog/<id>/`.
 *
 * `body` is Markdown per locale, read from `posts/<id>.<locale>.md` by the
 * composition root rather than written into `posts.json`. It is **not**
 * `required` here: the browser's copy of the posts (`/data/post.json`) leaves
 * the bodies out, and a record read back from it must still be a post. The
 * build requires it instead, as a rule of the site.
 *
 * `tags` and `technologies` are collections, so neither may be `filterable`
 * (entifix#34, #36): the blog's filter builds its `in` over them in code, as
 * the radar does over `areas`.
 */
@entity({ key: 'post', domain: 'blog' })
export class Post implements Entity {
  #id?: EntityId;
  #title?: LocalizedText;
  #summary?: LocalizedText;
  #body?: LocalizedText;
  #publishedAt?: Date;
  #updatedAt?: Date;
  #draft = false;
  #tags = new EntityCollectionLink(Tag);
  #technologies = new EntityCollectionLink(Technology);

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
  get title(): LocalizedText | undefined {
    return this.#title;
  }
  set title(value: LocalizedText | undefined) {
    this.#title = value;
  }

  /** What a preview shows: written, never cut from the body. */
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

  @accessor({ type: 'string', filterable: false, sortable: false })
  get body(): LocalizedText | undefined {
    return this.#body;
  }
  set body(value: LocalizedText | undefined) {
    this.#body = value;
  }

  @accessor({
    type: 'date',
    required: true,
    filterable: true,
    sortable: true,
  })
  get publishedAt(): Date | undefined {
    return this.#publishedAt;
  }
  set publishedAt(value: Date | undefined) {
    this.#publishedAt = value;
  }

  @accessor({ type: 'date' })
  get updatedAt(): Date | undefined {
    return this.#updatedAt;
  }
  set updatedAt(value: Date | undefined) {
    this.#updatedAt = value;
  }

  /** Shown by `next dev` only; never exported (ADR 0017). */
  @accessor({ type: 'boolean', required: true, filterable: true })
  get draft(): boolean {
    return this.#draft;
  }
  set draft(value: boolean) {
    this.#draft = value;
  }

  @accessor({ type: 'linkCollection' })
  get tags(): EntityCollectionLink<Tag> {
    return this.#tags;
  }

  /** The radar's technologies it is about, when it is about any. */
  @accessor({ type: 'linkCollection' })
  get technologies(): EntityCollectionLink<Technology> {
    return this.#technologies;
  }
}
