import { ThemeProvider } from '@emotion/react';
import type { RenderOptions } from '@testing-library/react';
import { render } from '@testing-library/react';
import React, { PropsWithChildren } from 'react';
import { BrowserRouter } from 'react-router-dom';

import { baseTheme } from '../src/presentation/theming/themes/base-theme';

export type CustomRenderOptions = Omit<RenderOptions, 'queries'>;

export function AllTheProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider theme={baseTheme}>
      <BrowserRouter>{children}</BrowserRouter>
    </ThemeProvider>
  );
}
const customRender = (
  ui: React.ReactElement | JSX.Element,
  options?: CustomRenderOptions,
) =>
  render(ui, {
    wrapper: props => <AllTheProviders {...props} />,
    ...options,
  });

export * from '@testing-library/react';
export { customRender as render };
