import { accessor, type Entity, entity, type EntityId } from '@entifix/core';

import type { LocalizedText } from '../localized-text.js';

/** Who the site is about. Exactly one record. */
@entity({ key: 'profile', domain: 'profile' })
export class Profile implements Entity {
  #id?: EntityId;
  #firstName = '';
  #lastName = '';
  #email = '';
  #title?: LocalizedText;
  #tagline?: LocalizedText;
  #bio?: LocalizedText;
  #pictureUrl?: string;
  #pictureAlt?: LocalizedText;
  #location?: LocalizedText;

  @accessor({ type: 'id' })
  get id(): EntityId {
    return this.#id;
  }
  set id(value: EntityId) {
    this.#id = value;
  }

  @accessor({ type: 'string', required: true })
  get firstName(): string {
    return this.#firstName;
  }
  set firstName(value: string) {
    this.#firstName = value;
  }

  @accessor({ type: 'string', required: true })
  get lastName(): string {
    return this.#lastName;
  }
  set lastName(value: string) {
    this.#lastName = value;
  }

  @accessor({ type: 'string', required: true })
  get email(): string {
    return this.#email;
  }
  set email(value: string) {
    this.#email = value;
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

  /** One line under the name in the hero (ADR 0008). */
  @accessor({
    type: 'string',
    required: true,
    filterable: false,
    sortable: false,
  })
  get tagline(): LocalizedText | undefined {
    return this.#tagline;
  }
  set tagline(value: LocalizedText | undefined) {
    this.#tagline = value;
  }

  @accessor({
    type: 'string',
    required: true,
    filterable: false,
    sortable: false,
  })
  get bio(): LocalizedText | undefined {
    return this.#bio;
  }
  set bio(value: LocalizedText | undefined) {
    this.#bio = value;
  }

  /** Flattened from the reference app's nested `picture`: composition holds arrays only. */
  @accessor({ type: 'string', required: true })
  get pictureUrl(): string | undefined {
    return this.#pictureUrl;
  }
  set pictureUrl(value: string | undefined) {
    this.#pictureUrl = value;
  }

  @accessor({
    type: 'string',
    required: true,
    filterable: false,
    sortable: false,
  })
  get pictureAlt(): LocalizedText | undefined {
    return this.#pictureAlt;
  }
  set pictureAlt(value: LocalizedText | undefined) {
    this.#pictureAlt = value;
  }

  /** Where Herber works from, as the CV's header states it: a recruiter filters on it. */
  @accessor({
    type: 'string',
    required: true,
    filterable: false,
    sortable: false,
  })
  get location(): LocalizedText | undefined {
    return this.#location;
  }
  set location(value: LocalizedText | undefined) {
    this.#location = value;
  }
}
