import {
  accessor,
  type Entity,
  entity,
  type EntityId,
  EntityLink,
} from '@entifix/core';

import type { LocalizedText } from '../localized-text.js';
import { Interest } from './interest.entity.js';

export const INTEREST_MEDIA_KINDS = ['photo', 'video'] as const;

export type InterestMediaKind = (typeof INTEREST_MEDIA_KINDS)[number];

/**
 * A photo or a video of an interest, in its section's gallery. Files live in
 * the app's `public/beyond-code/`, resized from originals kept out of git
 * (`tools/optimize-photo.sh`): `src` is the large copy, and `thumbnail` the
 * small one the gallery shows. A video names its `poster`, the still shown
 * until it plays.
 */
@entity({ key: 'interest-media', domain: 'profile' })
export class InterestMedia implements Entity {
  #id?: EntityId;
  #interest = new EntityLink(Interest);
  #kind: InterestMediaKind = 'photo';
  #src = '';
  #thumbnail?: string;
  #poster?: string;
  #alt?: LocalizedText;
  #featured = false;
  #order = 0;

  @accessor({ type: 'id' })
  get id(): EntityId {
    return this.#id;
  }
  set id(value: EntityId) {
    this.#id = value;
  }

  @accessor({ type: 'link', required: true })
  get interest(): EntityLink<Interest> {
    return this.#interest;
  }

  @accessor({
    type: 'enum',
    enumValues: INTEREST_MEDIA_KINDS,
    required: true,
    filterable: true,
  })
  get kind(): InterestMediaKind {
    return this.#kind;
  }
  set kind(value: InterestMediaKind) {
    this.#kind = value;
  }

  @accessor({ type: 'string', required: true })
  get src(): string {
    return this.#src;
  }
  set src(value: string) {
    this.#src = value;
  }

  @accessor({ type: 'string' })
  get thumbnail(): string | undefined {
    return this.#thumbnail;
  }
  set thumbnail(value: string | undefined) {
    this.#thumbnail = value;
  }

  @accessor({ type: 'string' })
  get poster(): string | undefined {
    return this.#poster;
  }
  set poster(value: string | undefined) {
    this.#poster = value;
  }

  /** What it shows, for a reader who cannot see it. */
  @accessor({
    type: 'string',
    required: true,
    filterable: false,
    sortable: false,
  })
  get alt(): LocalizedText | undefined {
    return this.#alt;
  }
  set alt(value: LocalizedText | undefined) {
    this.#alt = value;
  }

  /** Whether the landing page's teaser shows it. */
  @accessor({ type: 'boolean', required: true, filterable: true })
  get featured(): boolean {
    return this.#featured;
  }
  set featured(value: boolean) {
    this.#featured = value;
  }

  @accessor({ type: 'number', required: true, sortable: true })
  get order(): number {
    return this.#order;
  }
  set order(value: number) {
    this.#order = value;
  }
}
