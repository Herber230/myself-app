import { PaletteOption } from '@presentation-theming';
import { ReactNode } from 'react';

export interface ChipProps {
  children: ReactNode;
  onRemove: () => void;
  palette?: PaletteOption;
}
