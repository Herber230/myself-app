export type RingDefinition = {
  stage: string;
  label: string;
  color: string;
  radius: number;
};

export type Blip = {
  id: number;
  quadrant: number;
  ring: number;
  label: string;
  link: string;
  active: boolean;
  moved: number;
};

export type Area = string;

export type RadarProps = {
  ringsDefinition: Array<RingDefinition>;
  entries: Array<Blip>;
  areas: Array<Area>;
};
