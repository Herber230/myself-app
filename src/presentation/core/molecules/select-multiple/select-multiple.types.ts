import { PaletteOption } from '@presentation-theming';

export interface SelectMultipleProps<TOption> {
  keyProperty: keyof TOption;
  displayProperty: keyof TOption;
  options: TOption[];
  selection: TOption[];
  onChange: (selection: TOption[]) => void;
  palette?: PaletteOption;
}
