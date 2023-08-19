import type { PaletteOption } from '@presentation-theming/types';

export interface SelectMultipleProps<TOption> {
  keyProperty: keyof TOption;
  displayProperty: keyof TOption;
  options: TOption[];
  selection: TOption[];
  onChange: (selection: TOption[]) => void;
  palette?: PaletteOption;
}
