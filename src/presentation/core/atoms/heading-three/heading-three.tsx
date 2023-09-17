import styled from '@emotion/styled';
import { forwardRef } from 'react';

import type { HeadingThreeProps } from './heading-three.types';

const StyledHeadingThree = styled.h3`
  font-family: ${({ theme }) => theme.fonts.primary.family};
  font-weight: ${({ theme }) => theme.fonts.primary.weights.bold};
  font-size: 2.5rem;
  margin: 0;
  padding: 0;
`;

export const HeadingThree = forwardRef<HTMLHeadingElement, HeadingThreeProps>(
  ({ children, ...otherProps }, ref) => (
    <StyledHeadingThree ref={ref} {...otherProps}>
      {children}
    </StyledHeadingThree>
  ),
);
