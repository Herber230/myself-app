import { css, Global } from '@emotion/react';

export function GlobalStyles(): JSX.Element {
  return (
    <Global
      styles={css`
        html,
        body {
          height: 100%;
          margin: 0;
          padding: 0;
        }

        * {
          box-sizing: border-box;
        }
      `}
    />
  );
}
