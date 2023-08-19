import type { PaletteOption } from '@presentation-theming/types';
import { ReactNode } from 'react';

export interface ChipProps {
  children: ReactNode;
  onRemove: () => void;
  palette?: PaletteOption;
}
