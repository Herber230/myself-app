import { accessor, type Entity, entity, type EntityId } from '@entifix/core';

import type { LocalizedText } from '../localized-text.js';

/** A degree, finished or not. `end` absent means it is still in progress. */
@entity({ key: 'education', domain: 'cv' })
export class Education implements Entity {
  #id?: EntityId;
  #degree?: LocalizedText;
  #field?: LocalizedText;
  #institution = '';
  #start?: Date;
  #end?: Date;
  #completed = false;
  #order = 0;

  @accessor({ type: 'id' })
  get id(): EntityId {
    return this.#id;
  }
  set id(value: EntityId) {
    this.#id = value;
  }

  /** The level: "Master's degree", "Licenciatura". */
  @accessor({
    type: 'string',
    required: true,
    filterable: false,
    sortable: false,
  })
  get degree(): LocalizedText | undefined {
    return this.#degree;
  }
  set degree(value: LocalizedText | undefined) {
    this.#degree = value;
  }

  /** What it was in. */
  @accessor({
    type: 'string',
    required: true,
    filterable: false,
    sortable: false,
  })
  get field(): LocalizedText | undefined {
    return this.#field;
  }
  set field(value: LocalizedText | undefined) {
    this.#field = value;
  }

  /** A proper name, so written once rather than translated. */
  @accessor({ type: 'string', required: true })
  get institution(): string {
    return this.#institution;
  }
  set institution(value: string) {
    this.#institution = value;
  }

  @accessor({ type: 'date', required: true, sortable: true })
  get start(): Date | undefined {
    return this.#start;
  }
  set start(value: Date | undefined) {
    this.#start = value;
  }

  @accessor({ type: 'date', sortable: true })
  get end(): Date | undefined {
    return this.#end;
  }
  set end(value: Date | undefined) {
    this.#end = value;
  }

  /** False for studies left unfinished, which the CV says rather than hides. */
  @accessor({ type: 'boolean', required: true })
  get completed(): boolean {
    return this.#completed;
  }
  set completed(value: boolean) {
    this.#completed = value;
  }

  @accessor({ type: 'number', required: true, sortable: true })
  get order(): number {
    return this.#order;
  }
  set order(value: number) {
    this.#order = value;
  }
}
