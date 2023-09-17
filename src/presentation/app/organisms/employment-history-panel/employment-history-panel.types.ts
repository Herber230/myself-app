import type { EmploymentPeriod } from '@domain-app/entities/employment';

export interface EmploymentHistoryPanelUseCase {
  (): Promise<Array<EmploymentPeriod>>;
}

export interface EmploymentHistoryPanelState {
  isLoading: boolean;
  data: Array<EmploymentPeriod>;
}

export interface EmploymentHistoryPanelProps {
  uc: EmploymentHistoryPanelUseCase;
}
