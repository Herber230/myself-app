import type { TechnologyUsePeriod } from '@domain-app/entities/technology-use-period';

export function createMatrix(technologyUsePeriods: Array<TechnologyUsePeriod>) {
  const start = new Date();
  const end = new Date();

  return {
    start,
    end,
    rows: [],
  };
}
