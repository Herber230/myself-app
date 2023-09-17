import type { EntityId } from '@domain-generic/entities/entity-base';

export interface ProfilePicture {
  url: string;
  alt: string;
}

export interface ProfileBasicInfo {
  id: EntityId;
  firstName: string;
  lastName: string;
  email: string;
  title: string;
  picture: ProfilePicture;
  bio: string;
}
