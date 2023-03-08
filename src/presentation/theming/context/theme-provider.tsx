import { ThemeProvider as EmotionThemeProvider } from '@emotion/react';
import { useState } from 'react';

import { lightTheme } from '../themes';
import { ThemeContext } from './theme-context';

export interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps): JSX.Element {
  const [theme, setTheme] = useState(lightTheme);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <EmotionThemeProvider theme={theme}>{children}</EmotionThemeProvider>
    </ThemeContext.Provider>
  );
}
