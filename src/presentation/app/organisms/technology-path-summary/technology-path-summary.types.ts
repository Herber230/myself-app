import type { TechnologySummaryType } from '@domain-app/entities/technology-summary-type';
import type { TechnologyUsePeriod } from '@domain-app/entities/technology-use-period';

export interface TechnologyPathSummaryUseCase {
  (summaryType: TechnologySummaryType): Promise<Array<TechnologyUsePeriod>>;
}

export interface TechnologyPathSummaryState {
  isLoading: boolean;
  start: Date;
  end: Date;
  summaryType: TechnologySummaryType;
  rows: Array<TechnologyUsePeriod>;
}

export interface TechnologyPathSummaryProps {
  uc: TechnologyPathSummaryUseCase;
}
