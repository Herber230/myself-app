export interface Palette {
  main: string;
  light: string;
  dark: string;
  contrastText: string;
}

export interface PaletteOptions {
  primary: Palette;
  secondary?: Palette;
  error?: Palette;
  warning?: Palette;
  info?: Palette;
  success?: Palette;
}

export interface Theme {
  palettes: PaletteOptions;
}
