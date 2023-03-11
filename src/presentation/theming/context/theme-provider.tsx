import { ThemeProvider as EmotionThemeProvider } from '@emotion/react';
import { useState } from 'react';

import { FontFaces, GlobalStyles } from '../styles';
import { coldTheme } from '../themes';
import { ThemeContext } from './theme-context';
export interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps): JSX.Element {
  const [theme, setTheme] = useState(coldTheme);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <EmotionThemeProvider theme={theme}>
        <GlobalStyles />
        <FontFaces />
        {children}
      </EmotionThemeProvider>
    </ThemeContext.Provider>
  );
}
