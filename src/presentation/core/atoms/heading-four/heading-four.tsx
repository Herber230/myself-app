import styled from '@emotion/styled';
import { forwardRef } from 'react';

import type { HeadingFourProps } from './heading-four.types';

const StyledHeadingFour = styled.h4`
  font-family: ${({ theme }) => theme.fonts.primary.family};
  font-weight: ${({ theme }) => theme.fonts.primary.weights.bold};
  font-size: 1.8rem;
  margin: 0;
  padding: 0;
`;

export const HeadingFour = forwardRef<HTMLHeadingElement, HeadingFourProps>(
  ({ children, ...otherProps }, ref) => (
    <StyledHeadingFour ref={ref} {...otherProps}>
      {children}
    </StyledHeadingFour>
  ),
);
