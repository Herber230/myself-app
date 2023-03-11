import styled from '@emotion/styled';

import { HeadingFourProps } from './heading-four.types';

const StyledHeadingFour = styled.h4`
  font-family: ${({ theme }) => theme.fonts.primary.family};
  font-weight: ${({ theme }) => theme.fonts.primary.weights.bold};
  font-size: 2.25rem;
  margin: 0;
  padding: 0;
`;

export function HeadingFour({ children }: HeadingFourProps): JSX.Element {
  return <StyledHeadingFour>{children}</StyledHeadingFour>;
}
