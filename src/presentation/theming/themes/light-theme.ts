import { Theme } from '../types';

export const lightTheme: Theme = {
  palettes: {
    primary: {
      main: 'yellow',
      light: 'lightyellow',
      dark: 'darkyellow',
      contrastText: 'black',
    },
  },
  fonts: {
    primary: {
      family: 'Share Tech Mono',
      weights: {
        light: 300,
        regular: 400,
        bold: 700,
      },
    },
    secondary: {
      family: 'Ubuntu',
      weights: {
        light: 300,
        regular: 400,
        bold: 700,
      },
    },
  },
};
