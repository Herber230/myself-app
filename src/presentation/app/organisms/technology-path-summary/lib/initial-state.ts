import type { TechnologyPathSummaryState } from '../technology-path-summary.types';

export const initialState: TechnologyPathSummaryState = {
  isLoading: false,
  start: new Date(),
  end: new Date(),
  rows: [],
  summaryType: 'frontend',
};
