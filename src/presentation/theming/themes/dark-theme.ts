import { Theme } from '../types';

export const darkTheme: Theme = {
  palettes: {
    primary: {
      main: 'blue',
      light: 'lightblue',
      dark: 'darkblue',
      contrastText: 'white',
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
