import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { forwardRef } from 'react';

import { ButtonProps } from './button.types';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, palette = 'primary', type, ...otherProps }, ref) => {
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

    return (
      <StyledButton ref={ref} type={type} {...otherProps}>
        {children}
      </StyledButton>
    );
  },
);
