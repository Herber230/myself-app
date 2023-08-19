import styled from '@emotion/styled';
import { forwardRef } from 'react';

import type { HeadingTwoProps } from './heading-two.types';

const StyledHeadingTwo = styled.h2`
  font-family: ${({ theme }) => theme.fonts.primary.family};
  font-weight: ${({ theme }) => theme.fonts.primary.weights.bold};
  font-size: 3.25rem;
  margin: 0;
  padding: 0;
`;

export const HeadingTwo = forwardRef<HTMLHeadingElement, HeadingTwoProps>(
  ({ children, ...otherProps }, ref) => (
    <StyledHeadingTwo ref={ref} {...otherProps}>
      {children}
    </StyledHeadingTwo>
  ),
);
