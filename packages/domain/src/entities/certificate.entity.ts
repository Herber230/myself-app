import { accessor, type Entity, entity, type EntityId } from '@entifix/core';

/**
 * A certification. Its name and issuer are proper names, so neither is
 * translated.
 */
@entity({ key: 'certificate', domain: 'cv' })
export class Certificate implements Entity {
  #id?: EntityId;
  #name = '';
  #issuer = '';
  #issued?: Date;
  #url?: string;
  #order = 0;

  @accessor({ type: 'id' })
  get id(): EntityId {
    return this.#id;
  }
  set id(value: EntityId) {
    this.#id = value;
  }

  @accessor({ type: 'string', required: true })
  get name(): string {
    return this.#name;
  }
  set name(value: string) {
    this.#name = value;
  }

  @accessor({ type: 'string', required: true })
  get issuer(): string {
    return this.#issuer;
  }
  set issuer(value: string) {
    this.#issuer = value;
  }

  @accessor({ type: 'date', sortable: true })
  get issued(): Date | undefined {
    return this.#issued;
  }
  set issued(value: Date | undefined) {
    this.#issued = value;
  }

  /** Where it can be verified. */
  @accessor({ type: 'string' })
  get url(): string | undefined {
    return this.#url;
  }
  set url(value: string | undefined) {
    this.#url = value;
  }

  @accessor({ type: 'number', required: true, sortable: true })
  get order(): number {
    return this.#order;
  }
  set order(value: number) {
    this.#order = value;
  }
}
