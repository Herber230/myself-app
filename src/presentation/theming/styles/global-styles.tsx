import { css, Global } from '@emotion/react';

export function GlobalStyles(): JSX.Element {
  return (
    <Global
      styles={css`
        html,
        body,
        #root {
          width: 100%;
          min-height: 100vh;
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
