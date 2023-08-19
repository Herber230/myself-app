export interface TRRingDefinition {
  stage: string;
  label: string;
  color: string;
  radius: number;
}

export interface TRBlip {
  id: number;
  quadrant: number;
  ring: number;
  label: string;
  link: string;
  active: boolean;
  moved: number;
}

export interface RenderOptions {
  size: number;
  svgId?: string;
  colors?: {
    background?: string;
    grid?: string;
    inactive?: string;
  };
  printLayout?: boolean;
}
