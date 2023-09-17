import type { ProfileBasicInfo } from '@domain-app/entities/profile-basic-info';

import { profileBasicInfoHardcodedData } from '../data/profile-data';

export function profileBasicInfoHardcodedAdapter(): Promise<ProfileBasicInfo> {
  return Promise.resolve(profileBasicInfoHardcodedData);
}
