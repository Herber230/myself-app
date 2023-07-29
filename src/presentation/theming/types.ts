export interface Palette {
  main: string;
  light: string;
  dark: string;
  contrastText: string;
}

export interface PaletteOptions {
  primary: Palette;
  secondary: Palette;
  error: Palette;
  warning: Palette;
  info: Palette;
  success: Palette;
}

export type PaletteOption = keyof PaletteOptions;

export interface ColorOptions {
  white: string;
  black: string;
  grayScale: {
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
}

export interface Font {
  family: string;
  weights: {
    light: number;
    regular: number;
    bold: number;
  };
}

export interface FontOptions {
  primary: Font;
  secondary: Font;
}

export interface Spacing {
  (...args: number[]): string;
}

export interface Border {
  radius: {
    sm: string;
    md: string;
    lg: string;
  };
}

export interface Theme {
  palettes: PaletteOptions;
  fonts: FontOptions;
  colors: ColorOptions;
  spacing: Spacing;
  border: Border;
}
