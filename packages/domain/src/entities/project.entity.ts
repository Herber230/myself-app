import {
  accessor,
  type Entity,
  entity,
  EntityCollectionLink,
  type EntityId,
} from '@entifix/core';

import type { LocalizedText } from '../localized-text.js';
import { Technology } from './technology.entity.js';

/**
 * Something I built, shown in the landing page's projects section. Part of the
 * profile: the landing page is a page, not a business area (#75).
 *
 * No `imageUrl`: ADR 0008 settled the section as text and links, so a record
 * carrying a picture nothing renders would only rot. Its card's glyph is the
 * UI's, keyed by its id.
 */
@entity({ key: 'project', domain: 'profile' })
export class Project implements Entity {
  #id?: EntityId;
  #name = '';
  #summary?: LocalizedText;
  #overview?: LocalizedText;
  #url?: string;
  #repositoryUrl?: string;
  #technologies = new EntityCollectionLink(Technology);
  #featured = false;
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
    filterable: true,
    sortable: true,
  })
  get name(): string {
    return this.#name;
  }
  set name(value: string) {
    this.#name = value;
  }

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
   * What its page says first (#77): Markdown per locale, read from
   * `projects/<id>.<locale>.md` like a post's body, and optional for the same
   * reason — the browser's copy of the projects leaves it out.
   */
  @accessor({ type: 'string', filterable: false, sortable: false })
  get overview(): LocalizedText | undefined {
    return this.#overview;
  }
  set overview(value: LocalizedText | undefined) {
    this.#overview = value;
  }

  @accessor({ type: 'string' })
  get url(): string | undefined {
    return this.#url;
  }
  set url(value: string | undefined) {
    this.#url = value;
  }

  @accessor({ type: 'string' })
  get repositoryUrl(): string | undefined {
    return this.#repositoryUrl;
  }
  set repositoryUrl(value: string | undefined) {
    this.#repositoryUrl = value;
  }

  @accessor({ type: 'linkCollection' })
  get technologies(): EntityCollectionLink<Technology> {
    return this.#technologies;
  }

  /** Whether the landing page leads with it. */
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
