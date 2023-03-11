import styled from '@emotion/styled';

import { HeadingTwoProps } from './heading-two.types';

const StyledHeadingTwo = styled.h2`
  font-family: ${({ theme }) => theme.fonts.primary.family};
  font-weight: ${({ theme }) => theme.fonts.primary.weights.bold};
  font-size: 3.25rem;
  margin: 0;
  padding: 0;
`;

export function HeadingTwo({ children }: HeadingTwoProps): JSX.Element {
  return <StyledHeadingTwo>{children}</StyledHeadingTwo>;
}
