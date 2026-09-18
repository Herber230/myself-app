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
 * Something I built, for the landing page's projects section.
 *
 * No `imageUrl`: ADR 0008 settled the section as text and links, so a record
 * carrying a picture nothing renders would only rot.
 */
@entity({ key: 'project', domain: 'landing' })
export class Project implements Entity {
  #id?: EntityId;
  #name = '';
  #summary?: LocalizedText;
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
