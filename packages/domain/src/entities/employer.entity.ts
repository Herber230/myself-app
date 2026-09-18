import { accessor, type Entity, entity, type EntityId } from '@entifix/core';

import type { LocalizedText } from '../localized-text.js';

/** Somewhere I worked. Named once, referred to by every period under it. */
@entity({ key: 'employer', domain: 'cv' })
export class Employer implements Entity {
  #id?: EntityId;
  #name = '';
  #site?: string;
  #logoUrl?: string;
  #logoAlt?: LocalizedText;

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
    filterable: true,
    sortable: true,
  })
  get name(): string {
    return this.#name;
  }
  set name(value: string) {
    this.#name = value;
  }

  @accessor({ type: 'string' })
  get site(): string | undefined {
    return this.#site;
  }
  set site(value: string | undefined) {
    this.#site = value;
  }

  /** Flattened from the reference app's nested `logo`. */
  @accessor({ type: 'string' })
  get logoUrl(): string | undefined {
    return this.#logoUrl;
  }
  set logoUrl(value: string | undefined) {
    this.#logoUrl = value;
  }

  @accessor({ type: 'string', filterable: false, sortable: false })
  get logoAlt(): LocalizedText | undefined {
    return this.#logoAlt;
  }
  set logoAlt(value: LocalizedText | undefined) {
    this.#logoAlt = value;
  }
}
