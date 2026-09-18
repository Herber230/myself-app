import {
  accessor,
  type Entity,
  entity,
  EntityCollectionLink,
  type EntityId,
  EntityLink,
} from '@entifix/core';

import type { LocalizedText } from '../localized-text.js';
import { Quadrant } from './quadrant.entity.js';
import { Ring } from './ring.entity.js';
import { TechnologyArea } from './technology-area.entity.js';

/**
 * One blip on the radar, and one row of its legend.
 *
 * ⚠️ `areas` is where the radar's first query goes — "technologies in any of
 * these areas" — and it is **not** `filterable`. `describeEntityColumns`
 * refuses a queryable collection, because a generic comparison would match an
 * array against a scalar and find nothing, so the filter is built in code and
 * never parsed from a URL (entifix#34, entifix#36).
 */
@entity({ key: 'technology', domain: 'radar' })
export class Technology implements Entity {
  #id?: EntityId;
  #name = '';
  #description?: LocalizedText;
  #site?: string;
  #repositoryUrl?: string;
  #quadrant = new EntityLink(Quadrant);
  #ring = new EntityLink(Ring);
  #areas = new EntityCollectionLink(TechnologyArea);

  @accessor({ type: 'id' })
  get id(): EntityId {
    return this.#id;
  }
  set id(value: EntityId) {
    this.#id = value;
  }

  /** A product name, the same in both languages. */
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
  get description(): LocalizedText | undefined {
    return this.#description;
  }
  set description(value: LocalizedText | undefined) {
    this.#description = value;
  }

  @accessor({ type: 'string' })
  get site(): string | undefined {
    return this.#site;
  }
  set site(value: string | undefined) {
    this.#site = value;
  }

  @accessor({ type: 'string' })
  get repositoryUrl(): string | undefined {
    return this.#repositoryUrl;
  }
  set repositoryUrl(value: string | undefined) {
    this.#repositoryUrl = value;
  }

  @accessor({ type: 'link' })
  get quadrant(): EntityLink<Quadrant> {
    return this.#quadrant;
  }

  /** Where it sits now. Where it sat before is `TechnologyUsePeriod`. */
  @accessor({ type: 'link' })
  get ring(): EntityLink<Ring> {
    return this.#ring;
  }

  @accessor({ type: 'linkCollection' })
  get areas(): EntityCollectionLink<TechnologyArea> {
    return this.#areas;
  }
}
