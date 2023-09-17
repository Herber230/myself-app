import type { EntityId } from '@domain-generic/entities/entity-base';

import type { ImageSource } from './image';

export interface Employer {
  id: EntityId;
  name: string;
  site?: string;
  logo?: ImageSource;
}

export interface EmploymentPeriod {
  id: EntityId;
  employer: Employer;
  role: string;
  responsibilities: string;
  start: Date;
  end?: Date;
}
