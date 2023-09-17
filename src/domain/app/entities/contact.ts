import type { EntityId } from '@domain-generic/entities/entity-base';

export const CONTACT_INFO_TYPES = [
  'email',
  'linkedin',
  'github',
  'stackoverflow',
  'medium',
  'goodreads',
  'twitter',
  'facebook',
] as const;

export type ContactInfoType = (typeof CONTACT_INFO_TYPES)[number];

export interface ContactInfoData {
  displayName: string;
  url: string;
}

export interface ContactInfo
  extends Partial<Record<ContactInfoType, ContactInfoData | undefined>> {
  id: EntityId;
}
