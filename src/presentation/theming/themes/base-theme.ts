import { Theme } from '../types';

export const baseTheme: Theme = {
  palettes: {
    primary: {
      main: '#001d3d',
      light: '#003566',
      dark: '#000814',
      contrastText: '#caf0f8',
    },
    secondary: {
      main: '#ffc300',
      light: '#ffd60a',
      dark: '##F2CA00',
      contrastText: '#001d3d',
    },
    error: {
      main: '#d00000',
      light: '#dc2f02',
      dark: '#9d0208',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#faa307',
      light: '#ffba08',
      dark: '#f48c06',
      contrastText: '#ffffff',
    },
    info: {
      main: '#ced4da',
      light: '#dee2e6',
      dark: '#adb5bd',
      contrastText: '#343a40',
    },
    success: {
      main: '#70e000',
      light: '#9ef01a',
      dark: '#38b000',
      contrastText: '#ffffff',
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
  colors: {
    white: '#fff',
    black: '#000',
    grayScale: {
      100: '#f7f7f7',
      200: '#e1e1e1',
      300: '#cccccc',
      400: '#b7b7b7',
      500: '#a1a1a1',
      600: '#8c8c8c',
      700: '#767676',
      800: '#616161',
      900: '#4b4b4b',
    },
  },
  spacing: (...args: number[]) => {
    const s = 4; // base spacing unit
    return args.map((arg) => `${arg * s}px`).join(' ');
  },
  border: {
    radius: {
      sm: '4px',
      md: '8px',
      lg: '12px',
    },
  },
};
