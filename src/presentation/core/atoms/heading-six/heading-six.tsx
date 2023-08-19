import styled from '@emotion/styled';
import { forwardRef } from 'react';

import { HeadingSixProps } from './heading-six.types';

const StyledHeadingSix = styled.h6`
  font-family: ${({ theme }) => theme.fonts.primary.family};
  font-weight: ${({ theme }) => theme.fonts.primary.weights.bold};
  font-size: 1.25rem;
  margin: 0;
  padding: 0;
`;

export const HeadingSix = forwardRef<HTMLHeadingElement, HeadingSixProps>(
  ({ children, ...otherProps }, ref) => (
    <StyledHeadingSix ref={ref} {...otherProps}>
      {children}
    </StyledHeadingSix>
  ),
);
