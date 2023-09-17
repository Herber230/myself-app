export const TECHNOLOGY_SUMMARY_TYPE = [
  'frontend',
  'backend',
  'infrastructure',
  'fullstack',
  'mostExperienced',
] as const;

export type TechnologySummaryType = (typeof TECHNOLOGY_SUMMARY_TYPE)[number];
