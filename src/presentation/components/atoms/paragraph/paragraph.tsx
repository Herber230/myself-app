import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import {
  ParagraphLineHeights,
  ParagraphProps,
  ParagraphSizes,
} from './paragraph.types';

export function Paragraph({
  children,
  size = 'normal',
  lineHeight = 'normal',
}: ParagraphProps): JSX.Element {
  const theme = useTheme();

  const StyledParagraph = styled.p`
    font-family: ${theme.fonts.secondary.family};
    font-size: ${ParagraphSizes[size]};
    line-height: ${ParagraphLineHeights[lineHeight]};
  `;

  return <StyledParagraph>{children}</StyledParagraph>;
}
