import {
  accessor,
  type Entity,
  entity,
  EntityCollectionLink,
  type EntityId,
} from '@entifix/core';

import type { LocalizedText } from '../localized-text.js';
import { CvFocus } from './cv-focus.entity.js';
import { EmploymentPeriod } from './employment-period.entity.js';
import { Technology } from './technology.entity.js';

/**
 * One reading of the same career — "Herber as backend" — as data rather than
 * as a use case. The reference app had a `TechnologySummaryType` and a use
 * case that was never implemented; a variant selects records instead, so a new
 * reading is a content edit.
 *
 * The id is the slug the CV route is built from, so it appears in a URL.
 *
 * Its focuses pick, inside each employment, the highlights it shows (ADR 0012).
 */
@entity({ key: 'cv-variant', domain: 'cv' })
export class CvVariant implements Entity {
  #id?: EntityId;
  #title?: LocalizedText;
  #summary?: LocalizedText;
  #technologies = new EntityCollectionLink(Technology);
  #employments = new EntityCollectionLink(EmploymentPeriod);
  #focuses = new EntityCollectionLink(CvFocus);
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
  get title(): LocalizedText | undefined {
    return this.#title;
  }
  set title(value: LocalizedText | undefined) {
    this.#title = value;
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

  @accessor({ type: 'linkCollection' })
  get technologies(): EntityCollectionLink<Technology> {
    return this.#technologies;
  }

  @accessor({ type: 'linkCollection' })
  get employments(): EntityCollectionLink<EmploymentPeriod> {
    return this.#employments;
  }

  /** Which highlights of each employment it shows: those sharing a focus. */
  @accessor({ type: 'linkCollection' })
  get focuses(): EntityCollectionLink<CvFocus> {
    return this.#focuses;
  }

  @accessor({ type: 'number', required: true, sortable: true })
  get order(): number {
    return this.#order;
  }
  set order(value: number) {
    this.#order = value;
  }
}
