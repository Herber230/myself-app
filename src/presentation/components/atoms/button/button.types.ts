import { PaletteOptions } from '@presentation/theming';

export interface ButtonProps {
  children: React.ReactNode | string;
  palette?: keyof PaletteOptions;
}
