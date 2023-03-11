import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { ButtonProps } from './button.types';

export function Button({
  children,
  palette = 'primary',
}: ButtonProps): JSX.Element {
  const theme = useTheme();

  const StyledButton = styled.button`
    background-color: ${theme.palettes[palette].main};
    color: ${theme.palettes[palette].contrastText};
    padding: ${theme.spacing(1, 2)};
    border: none;
    box-shadow: none;

    :hover {
      background-color: ${theme.palettes[palette].light};
    }
  `;

  return <StyledButton>{children}</StyledButton>;
}
