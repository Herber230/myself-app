import styled from '@emotion/styled';

import { HeadingOneProps } from './heading-one.types';

const StyledHeadingOne = styled.h1`
  font-family: ${({ theme }) => theme.fonts.primary.family};
  font-weight: ${({ theme }) => theme.fonts.primary.weights.bold};
  font-size: 3rem;
`;

export function HeadingOne({ children }: HeadingOneProps): JSX.Element {
  return <StyledHeadingOne>{children}</StyledHeadingOne>;
}
