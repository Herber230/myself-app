import styled from '@emotion/styled';
import { forwardRef } from 'react';

import type { HeadingOneProps } from './heading-one.types';

const StyledHeadingOne = styled.h1`
  font-family: ${({ theme }) => theme.fonts.primary.family};
  font-weight: ${({ theme }) => theme.fonts.primary.weights.bold};
  font-size: 5rem;
  margin: 0;
  padding: 0;
`;

export const HeadingOne = forwardRef<HTMLHeadingElement, HeadingOneProps>(
  ({ children, ...otherProps }, ref) => (
    <StyledHeadingOne ref={ref} {...otherProps}>
      {children}
    </StyledHeadingOne>
  ),
);
