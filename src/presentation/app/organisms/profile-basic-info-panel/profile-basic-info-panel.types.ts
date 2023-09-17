import type { ProfileBasicInfo } from '@domain-app/entities/profile-basic-info';

export interface ProfileBasicInfoPanelUseCase {
  (): Promise<ProfileBasicInfo>;
}

export interface ProfileBasicInfoPanelState extends ProfileBasicInfo {
  isLoading: boolean;
}

export interface ProfileBasicInfoPanelProps {
  uc: ProfileBasicInfoPanelUseCase;
}
