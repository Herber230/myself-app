import type { PaletteOption } from '@presentation-theming/types';

export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  palette?: PaletteOption;
  fill?: boolean;
}
