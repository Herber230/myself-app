import { accessor, type Entity, entity, type EntityId } from '@entifix/core';

/**
 * The reference app kept contacts as one object keyed by channel. entifix has
 * no member type for arbitrary keys, so each channel is a record, and the
 * checked-at-load rule "at most one per type" replaces what the keys gave.
 */
export const CONTACT_CHANNEL_TYPES = [
  'email',
  'linkedin',
  'github',
  'stackoverflow',
  'medium',
  'goodreads',
  'x',
] as const;

export type ContactChannelType = (typeof CONTACT_CHANNEL_TYPES)[number];

@entity({ key: 'contact-channel', domain: 'profile' })
export class ContactChannel implements Entity {
  #id?: EntityId;
  #type: ContactChannelType = 'email';
  #displayName = '';
  #url = '';
  #order = 0;

  @accessor({ type: 'id' })
  get id(): EntityId {
    return this.#id;
  }
  set id(value: EntityId) {
    this.#id = value;
  }

  @accessor({
    type: 'enum',
    enumValues: CONTACT_CHANNEL_TYPES,
    required: true,
    filterable: true,
  })
  get type(): ContactChannelType {
    return this.#type;
  }
  set type(value: ContactChannelType) {
    this.#type = value;
  }

  /** The handle as it is shown. Not localized: a handle is the same in both. */
  @accessor({ type: 'string', required: true })
  get displayName(): string {
    return this.#displayName;
  }
  set displayName(value: string) {
    this.#displayName = value;
  }

  @accessor({ type: 'string', required: true })
  get url(): string {
    return this.#url;
  }
  set url(value: string) {
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
