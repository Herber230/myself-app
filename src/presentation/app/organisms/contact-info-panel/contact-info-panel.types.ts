import type { ContactInfo } from "@domain-app/entities/contact";

export interface ContactInfoPanelUseCase {
  (): Promise<ContactInfo>;
}

export interface ContactInfoPanelState extends ContactInfo {
  isLoading: boolean;
}

export interface ContactInfoPanelProps {
  uc: ContactInfoPanelUseCase;
}
