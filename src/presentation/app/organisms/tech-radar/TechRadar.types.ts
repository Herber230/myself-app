export type TRRingDefinition = {
  stage: string;
  label: string;
  color: string;
  radius: number;
};

export type TechRadarProps = {
  ringsDefinition: Array<TRRingDefinition>;
  entries: Array<TRBlip>;
  areas: Array<string>;
};

export type TRBlip = {
  id: number;
  quadrant: number;
  ring: number;
  label: string;
  link: string;
  active: boolean;
  moved: number;
};
