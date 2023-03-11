import styled from '@emotion/styled';

import { HeadingFiveProps } from './heading-five.types';

const StyledHeadingFive = styled.h5`
  font-family: ${({ theme }) => theme.fonts.primary.family};
  font-weight: ${({ theme }) => theme.fonts.primary.weights.bold};
  font-size: 1.75rem;
  margin: 0;
  padding: 0;
`;

export function HeadingFive({ children }: HeadingFiveProps): JSX.Element {
  return <StyledHeadingFive>{children}</StyledHeadingFive>;
}
