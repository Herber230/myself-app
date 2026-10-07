import {
  accessor,
  type Entity,
  entity,
  type EntityId,
  EntityLink,
} from '@entifix/core';

import type { LocalizedText } from '../localized-text.js';
import { LayerPackage } from './layer-package.entity.js';

/**
 * An import lint refuses between two packages (ADR 0022), and why: drawn on
 * demand, dashed, beside the ones allowed.
 */
@entity({ key: 'refused-import', domain: 'engineering' })
export class RefusedImport implements Entity {
  #id?: EntityId;
  #reason?: LocalizedText;
  #from = new EntityLink(LayerPackage);
  #to = new EntityLink(LayerPackage);

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
  get reason(): LocalizedText | undefined {
    return this.#reason;
  }
  set reason(value: LocalizedText | undefined) {
    this.#reason = value;
  }

  @accessor({ type: 'link', required: true })
  get from(): EntityLink<LayerPackage> {
    return this.#from;
  }

  @accessor({ type: 'link', required: true })
  get to(): EntityLink<LayerPackage> {
    return this.#to;
  }
}
