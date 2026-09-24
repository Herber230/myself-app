import {
  accessor,
  type Entity,
  entity,
  EntityCollectionLink,
  type EntityId,
  EntityLink,
} from '@entifix/core';

import type { LocalizedText } from '../localized-text.js';
import { CvFocus } from './cv-focus.entity.js';
import { EmploymentPeriod } from './employment-period.entity.js';

/**
 * One bullet under an employment: something done, ideally with its outcome.
 * A variant shows the ones sharing one of its focuses (ADR 0012).
 */
@entity({ key: 'employment-highlight', domain: 'cv' })
export class EmploymentHighlight implements Entity {
  #id?: EntityId;
  #period = new EntityLink(EmploymentPeriod);
  #text?: LocalizedText;
  #focuses = new EntityCollectionLink(CvFocus);
  #order = 0;

  @accessor({ type: 'id' })
  get id(): EntityId {
    return this.#id;
  }
  set id(value: EntityId) {
    this.#id = value;
  }

  @accessor({ type: 'link' })
  get period(): EntityLink<EmploymentPeriod> {
    return this.#period;
  }

  @accessor({
    type: 'string',
    required: true,
    filterable: false,
    sortable: false,
  })
  get text(): LocalizedText | undefined {
    return this.#text;
  }
  set text(value: LocalizedText | undefined) {
    this.#text = value;
  }

  @accessor({ type: 'linkCollection' })
  get focuses(): EntityCollectionLink<CvFocus> {
    return this.#focuses;
  }

  /** Its place among its employment's highlights. */
  @accessor({ type: 'number', required: true, sortable: true })
  get order(): number {
    return this.#order;
  }
  set order(value: number) {
    this.#order = value;
  }
}
