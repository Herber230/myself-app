import type { PaletteOptions } from '@presentation-theming/types';
import type { HTMLProps } from 'react';

// Base props to solve conflicts with Styled Components
type ButtonBaseProps = Omit<HTMLProps<HTMLButtonElement>, 'as' | 'type'>;
export interface ButtonProps extends ButtonBaseProps {
  palette?: keyof PaletteOptions;
  type?: 'button' | 'submit' | 'reset';
}
