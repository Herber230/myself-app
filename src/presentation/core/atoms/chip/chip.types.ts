import type { PaletteOption } from '@presentation-theming/types';
import type { ReactNode } from 'react';

export interface ChipProps {
  children: ReactNode;
  onRemove: () => void;
  palette?: PaletteOption;
}
