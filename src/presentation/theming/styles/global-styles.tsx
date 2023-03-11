import { css, Global, useTheme } from '@emotion/react';

export function GlobalStyles(): JSX.Element {
  const theme = useTheme();
  return (
    <Global
      styles={css`
        html,
        body {
          height: 100%;
          margin: 0;
          padding: 0;
          background-color: ${theme.palettes.primary.main};
        }

        * {
          box-sizing: border-box;
        }
      `}
    />
  );
}
