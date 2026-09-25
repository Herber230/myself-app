import { accessor, type Entity, entity, type EntityId } from '@entifix/core';

/**
 * A redraw of the radar (#39). A blip's movement — new, moved in, moved out —
 * is measured against the latest edition's `date`, so the radar only changes
 * shape when an edition is added, never merely because a build ran later.
 */
@entity({ key: 'radar-edition', domain: 'radar' })
export class RadarEdition implements Entity {
  #id?: EntityId;
  #date?: Date;

  @accessor({ type: 'id' })
  get id(): EntityId {
    return this.#id;
  }
  set id(value: EntityId) {
    this.#id = value;
  }

  @accessor({ type: 'date', required: true, sortable: true })
  get date(): Date | undefined {
    return this.#date;
  }
  set date(value: Date | undefined) {
    this.#date = value;
  }
}
