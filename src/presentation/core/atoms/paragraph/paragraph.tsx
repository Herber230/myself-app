import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { forwardRef } from 'react';

import {
  ParagraphLineHeights,
  ParagraphProps,
  ParagraphSizes,
} from './paragraph.types';

export const Paragraph = forwardRef<HTMLParagraphElement, ParagraphProps>(
  (
    { children, size = 'normal', lineHeight = 'normal', ...otherProps },
    ref,
  ) => {
    const theme = useTheme();

    const StyledParagraph = styled.p`
      font-family: ${theme.fonts.secondary.family};
      font-size: ${ParagraphSizes[size]};
      line-height: ${ParagraphLineHeights[lineHeight]};
      margin: 0;
      padding: 0;
    `;

    return (
      <StyledParagraph ref={ref} {...otherProps}>
        {children}
      </StyledParagraph>
    );
  },
);
