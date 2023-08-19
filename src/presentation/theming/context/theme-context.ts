import { createContext, useContext } from 'react';

import type { Theme } from '../types';

export interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const ThemeContext = createContext({} as ThemeContextValue);

export const useThemeContext = () => useContext(ThemeContext);
