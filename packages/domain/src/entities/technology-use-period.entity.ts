import {
  accessor,
  type Entity,
  entity,
  type EntityId,
  EntityLink,
} from '@entifix/core';

import { Ring } from './ring.entity.js';
import { Technology } from './technology.entity.js';

/**
 * A stretch during which one technology sat in one ring. Two periods for the
 * same technology are what a blip's movement is read from, so the radar can
 * say a thing moved in rather than only where it is.
 */
@entity({ key: 'technology-use-period', domain: 'radar' })
export class TechnologyUsePeriod implements Entity {
  #id?: EntityId;
  #technology = new EntityLink(Technology);
  #ring = new EntityLink(Ring);
  #start?: Date;
  #end?: Date;

  @accessor({ type: 'id' })
  get id(): EntityId {
    return this.#id;
  }
  set id(value: EntityId) {
    this.#id = value;
  }

  @accessor({ type: 'link' })
  get technology(): EntityLink<Technology> {
    return this.#technology;
  }

  @accessor({ type: 'link' })
  get ring(): EntityLink<Ring> {
    return this.#ring;
  }

  @accessor({ type: 'date', required: true, sortable: true })
  get start(): Date | undefined {
    return this.#start;
  }
  set start(value: Date | undefined) {
    this.#start = value;
  }

  /** Absent while this is where the technology still sits. */
  @accessor({ type: 'date', sortable: true })
  get end(): Date | undefined {
    return this.#end;
  }
  set end(value: Date | undefined) {
    this.#end = value;
  }
}
